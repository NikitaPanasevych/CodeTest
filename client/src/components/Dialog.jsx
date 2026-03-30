export default function Dialog({ onClick, children }) {
	return (
		<div
			onClick={onClick}
			className="bg-[#fdf8f0] min-w-[320px] max-w-[420px] w-full rounded-sm overflow-hidden shadow-[0_32px_80px_rgba(61,31,13,0.45)]"
		>
			<div className="h-[3px] bg-gradient-to-r from-[#8b6914] via-[#d4a843] to-[#8b6914]" />
			<div className="px-8 py-7">{children}</div>
		</div>
	);
}
