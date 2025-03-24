import { Link, LinkProps } from "react-router-dom";

interface StyledLinkProps extends LinkProps {
  className?: string;
}

const StyledLink = ({ className = "", ...props }: StyledLinkProps) => {
  return (
    <Link
      className={`font-medium text-blue-600 dark:text-blue-500 hover:underline ${className}`}
      {...props}
    />
  );
};

export default StyledLink;
