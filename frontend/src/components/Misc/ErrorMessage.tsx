function ErrorMessage({ children }: { children: string }) {
    return (
        <p className="text-red-600 text-xs italic">{children}</p>
    )
}

export default ErrorMessage