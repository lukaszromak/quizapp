const axios = require('axios');
const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws'); 

// Configuration
const baseURL = 'http://localhost:8080';
const wsURL = 'ws://localhost:8080/api/ws';
const x = 1; // Number of hosts
const y = x * 10; // Number of players (10 players per host)

// User storage
const users = [];
const games = [];

// Helper: Delay for async operations
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Step 1: Sign in all users and retrieve tokens
async function signInUsers() {
  console.log('Signing in users...');
  for (let i = 1; i <= x + y; i++) {
    const email = `test${i}@testmail.com`;
    const password = '123';
    try {
      const response = await axios.post(`${baseURL}/api/auth/testsignin`, { email: email, password: password }, { withCredentials: true });
      users.push({
        id: response.data.id,
        email: response.data.email,
        roles: response.data.roles,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    } catch (error) {
      console.error(`Error signing in user ${email}:`, error.message);
    }
  }
  console.log('Sign-in completed.');
}

async function createGames() {
  console.log('Creating games...');
  const hostUsers = users.slice(0, x); // First x users are hosts

  for (const host of hostUsers) {
    try {
      // Attempt to create the game
      await attemptCreateGame(host);
    } catch (error) {
      console.error(`Game creation failed for host ${host.email}:`, error.message);
    }
  }

  console.log('Game creation completed.');
}

async function attemptCreateGame(host) {
  try {
    const response = await axios.post(
      `${baseURL}/api/game/create/1`,
      {}, // Empty body for the POST request
      {
        headers: {
          Cookie: `ACCESS_TOKEN=${host.accessToken}`, // Send the token as a cookie
        },
      }
    );

    // Validate and store the gameCode
    const gameCode = response.data.gameCode;
    if (gameCode && gameCode.length === 6) {
      games.push({ host, gameCode });
      console.log(`Game created successfully: ${gameCode}`);
    } else {
      console.error('Invalid game code:', gameCode);
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // If unauthorized, try to refresh the token
      console.log(`Refreshing token for host ${host.email}...`);
      const refreshed = await refreshAccessToken(host);
      if (refreshed) {
        // Retry game creation after refreshing token
        await attemptCreateGame(host);
      } else {
        console.error(`Failed to refresh token for host ${host.email}`);
      }
    } else {
      // Rethrow other errors
      throw error;
    }
  }
}

async function refreshAccessToken(host) {
  try {
    const response = await axios.post(
      `${baseURL}/api/auth/testrefreshtoken`,
      {}, // Empty body for the POST request
      {
        headers: {
          Cookie: `REFRESH_TOKEN=${host.refreshToken}`, // Send the refresh token as a cookie
        },
      }
    );

    // Update the host's access token
    console.log(response.data)
    host.accessToken = response.data.accessToken;
    console.log(`Token refreshed successfully for host ${host.email}`);
    return true;
  } catch (error) {
    console.error(`Error refreshing token for host ${host.email}:`, error.message);
    return false;
  }
}

async function connectWebSockets() {
  console.log('Connecting STOMP WebSocket clients...');

  const connections = users.map((user) => {
    return new Promise((resolve, reject) => {
      attemptStompConnection(user)
        .then((client) => {
          user.client = client 
          resolve(client)
        })
        .catch((err) => {
          console.error(`STOMP connection failed for user ${user.email}:`, err.message);
          reject(err);
        });
    });
  });

  // Await all connections
  try {
    await Promise.all(connections);
    console.log('All STOMP WebSocket clients connected.');
  } catch (error) {
    console.error('Some STOMP connections failed.');
  }
}

async function attemptStompConnection(user) {
  return new Promise((resolve, reject) => {
    const client = new Client({
      brokerURL: wsURL, // Your WebSocket URL
      connectHeaders: {}, // No headers needed for cookie-based auth
      webSocketFactory: () => {
        // Include cookies in the WebSocket request headers
        console.log(user.accessToken)
        return new WebSocket(wsURL, {
          headers: {
            Cookie: `ACCESS_TOKEN=${user.accessToken}`,
          },
        });
      },
      debug: (str) => console.log(`STOMP: ${str}`),
      reconnectDelay: 5000, // Reconnect delay (optional)
      onConnect: () => {
        console.log(`STOMP connected for user: ${user.email}`);
        resolve(client);
      },
      onWebSocketError: async () => {
        console.log("ws error, refreshing token")
        const refreshed = await refreshAccessToken(user);
        if (refreshed) {
          client.deactivate(); // Disconnect the old client
          // Retry connection after refreshing token
          attemptStompConnection(user)
            .then((newClient) => resolve(newClient))
            .catch((retryErr) => reject(retryErr));
        }
      },
    });

    client.activate(); // Initiate the connection
  });
}

// Run the load test
(async function runLoadTest() {
  console.log('Starting load test...');
  await signInUsers();
  await delay(1000); // Small delay for API readiness
  await createGames();
  await delay(1000); // Small delay for game creation propagation
  await connectWebSockets();
  console.log('Load test completed.');
})();
