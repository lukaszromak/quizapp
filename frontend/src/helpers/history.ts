import { NavigateFunction, Location } from "react-router-dom";

interface History {
    navigate: NavigateFunction | null;
    location: Location | null;
}

// custom history object to allow navigation outside react components
export const history: History = {
    navigate: null,
    location: null
};