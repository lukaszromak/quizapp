import { Link } from "react-router-dom"

interface NavigationButtonProps {
  children: string;
  navigateTo: string;
  state?: object;
  className?: string;
}

function NavigationButton({ children, navigateTo, state = {}, className="" }: NavigationButtonProps) {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
      <Link to={navigateTo} state={state} className={className}>{children}</Link>
    </button>
  )
}

export default NavigationButton