import { cloneElement } from "react";
import { ReactHTMLElement, ReactNode } from "react";

const sizes = [
    "text-5xl sm:text-6xl md:text-6xl lg:text-8xl xl:text-9xl",
    "text-3xl sm:text-4xl md:text-4xl lg:text-6xl xl:text-7xl"
]

function BigTextContainer({ children, ref_, size }: { children: JSX.Element[], ref_?: React.RefObject<HTMLInputElement>, size?: number }) {
    const s = size || 0
    return (
        <div className="flex items-center justify-center h-screen" ref={ref_}>
            <div className="flex flex-col items-center">
                {children.map((child, idx) => (
                    cloneElement(child, {
                        className: `${child.props.className || ''} ${sizes[s]}`,
                        key: idx
                    })
                ))}
            </div>
        </div>
    )
}

export default BigTextContainer