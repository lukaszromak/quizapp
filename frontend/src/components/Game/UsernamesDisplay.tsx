function UsernamesDisplay({ usernames }: { usernames: Array<string>}) {
    return (
        <div className="max-w-100 flex flex-column flex-wrap gap-1">
            {usernames.map((item, idx) => (
                <span key={idx} className="p-2 border rounded font-medium mb-1">{item}</span>
            ))}
        </div>
    )
}

export default UsernamesDisplay