import { Link } from "react-router-dom"

function NavigationButton({ children, navigateTo }: { children: string, navigateTo: string }) {
    return (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
            <Link to={navigateTo}>{children}</Link>
        </button>
    )
}

export default NavigationButton