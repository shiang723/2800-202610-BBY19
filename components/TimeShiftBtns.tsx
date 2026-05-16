export default function TimeShiftBtns({ displayTime, changeTime }: { displayTime: string; changeTime: (hours: number) => void }) {
    return (
        <div className="fixed bottom-17 left-0 right-0 flex justify-center bg-opacity-50 rounded">
            <div className="flex justify-center">
                <button
                    onClick={() => changeTime(-0.5)}
                    className="mx-1 px-2 py-1 bg-white text-black text-xs rounded"
                >
                    -30m
                </button>
                <button
                    onClick={() => changeTime(-1)}
                    className="mx-1 px-2 py-1 bg-white text-black text-xs rounded"
                >
                    -1h
                </button>
                <div className="mx-1 px-2 py-1 bg-white text-black text-sm rounded">
                    {displayTime}
                </div>
                <button
                    onClick={() => changeTime(1)}
                    className="mx-1 px-2 py-1 bg-white text-black text-xs rounded"
                >
                    +1h
                </button>
                <button
                    onClick={() => changeTime(0.5)}
                    className="mx-1 px-2 py-1 bg-white text-black text-xs rounded"
                >
                    +30m
                </button>
            </div>
        </div>
    )
}