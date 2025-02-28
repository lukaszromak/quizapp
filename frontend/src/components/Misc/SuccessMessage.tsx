function SuccessMessage({ children }: { children: string }) {
    return (
        <p className="text-green-600 text-xs italic">{children}</p>
    )
}

export default SuccessMessage