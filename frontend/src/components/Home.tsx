function Home() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
                <div className="text-5xl sm:text-6xl md:text-6xl lg:text-8xl xl:text-9xl">Enter code to enter</div>
                <div className="text-5xl sm:text-6xl md:text-6xl lg:text-8xl xl:text-8xl">
                    <input type="text" maxLength={6}></input>
                </div>
            </div>
        </div>
    )
}

export default Home