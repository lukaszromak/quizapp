// WORKING COLORS: (ADD IT HERE SO IT WORKS WITH FUNCTION BELOW)
// hover:bg-red-700 bg-red-500 text-red-700 border-red-700
// hover:bg-green-700 bg-green-500 text-green-700 border-green-700
// hover:bg-blue-700 bg-blue-500 text-blue-700 border-blue-700
// hover:bg-gray-700 bg-gray-500 text-gray-700 border-gray-700
// hover:bg-indigo-700 bg-indigo-500 text-indigo-700 border-indigo-700
const getButtonStyle = (color: string) => {
    return `bg-${color}-500 hover:bg-${color}-700 text-white font-semibold text-white py-2 px-4 border border-${color}-700 hover:border-transparent rounded`
}

interface ButtonProps {
    children: string,
    onClick?: Function,
    color: string,
    style?: string,
    disabled?: boolean
}

function Button(props: ButtonProps) {
    return (
        <button onClick={() => props.onClick ? props.onClick() : {}}
                className={`${props.style} ${getButtonStyle(props.color)}`}
                disabled={props.disabled}>
            {props.children}
        </button>
    )
}

export default Button