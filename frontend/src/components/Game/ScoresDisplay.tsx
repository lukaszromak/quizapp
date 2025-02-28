function ScoresDisplay({scores}: {scores: Map<string, number>}) {
    return (
        <div className="max-w-100 flex flex-column flex-wrap gap-1">
        {Array.from(scores.entries()).toSorted((a, b) => {
            if(a[0] == b[0]) return a[0].localeCompare(b[0])
            return a[1] - b[1]
        }).map((entry) => (
            <div key={entry[0]} className="p-2 border rounded font-medium mb-1">
                {`${entry[0]} ${entry[1]}`}
            </div>
        ))}
        </div>
    )
}

export default ScoresDisplay