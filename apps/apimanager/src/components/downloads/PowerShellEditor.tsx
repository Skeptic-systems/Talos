import { useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";

type PowerShellEditorProps = {
	value: string;
	onChange: (value: string) => void;
};

export function PowerShellEditor({ value, onChange }: PowerShellEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);
	const [lineCount, setLineCount] = useState(1);

	useEffect(() => {
		const lines = value.split("\n").length;
		setLineCount(Math.max(lines, 10));
	}, [value]);

	const syncScroll = () => {
		if (textareaRef.current && highlightRef.current) {
			highlightRef.current.scrollTop = textareaRef.current.scrollTop;
			highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
		}
	};

	const highlightPowerShell = (code: string): string => {
		const keywords =
			/\b(function|param|begin|process|end|if|else|elseif|switch|while|for|foreach|do|until|try|catch|finally|throw|return|break|continue|exit|trap|filter|class|enum|using|namespace|import-module|export-modulemember)\b/gi;
		const cmdlets =
			/\b(Get-|Set-|New-|Remove-|Add-|Clear-|Write-|Read-|Out-|Start-|Stop-|Invoke-|Test-|Import-|Export-|Select-|Where-|ForEach-|Sort-|Group-|Measure-|Compare-|Copy-|Move-|Rename-|Split-|Join-|ConvertTo-|ConvertFrom-|Format-)\w+/gi;
		const variables = /\$[\w]+/g;
		const strings = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
		const comments = /#.*$/gm;
		const operators = /(-eq|-ne|-gt|-lt|-ge|-le|-like|-notlike|-match|-notmatch|-contains|-notcontains|-in|-notin|-replace|-and|-or|-not|-band|-bor|-bnot|-bxor)/gi;

		let result = code
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		result = result.replace(
			comments,
			'<span class="text-zinc-500 dark:text-zinc-500">$&</span>',
		);

		result = result.replace(
			strings,
			'<span class="text-green-600 dark:text-green-400">$&</span>',
		);

		result = result.replace(
			keywords,
			'<span class="text-purple-600 dark:text-purple-400 font-medium">$&</span>',
		);

		result = result.replace(
			cmdlets,
			'<span class="text-blue-600 dark:text-blue-400">$&</span>',
		);

		result = result.replace(
			variables,
			'<span class="text-amber-600 dark:text-amber-400">$&</span>',
		);

		result = result.replace(
			operators,
			'<span class="text-pink-600 dark:text-pink-400">$&</span>',
		);

		return result;
	};

	return (
		<div className="space-y-3">
			<Label className="text-zinc-700 dark:text-zinc-300">
				PowerShell script *
			</Label>
			<p className="text-xs text-zinc-500 dark:text-zinc-400">
				Write your custom PowerShell script. This will be saved as the download command.
			</p>

			<div className="relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-900 dark:border-zinc-700">
				<div className="flex">
					<div className="flex-shrink-0 select-none border-r border-zinc-700 bg-zinc-800 px-3 py-3 text-right font-mono text-xs text-zinc-500">
						{Array.from({ length: lineCount }, (_, i) => (
							<div key={i} className="leading-6">
								{i + 1}
							</div>
						))}
					</div>

					<div className="relative flex-1 overflow-hidden">
						<div
							ref={highlightRef}
							className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-6 text-zinc-100"
							aria-hidden="true"
							dangerouslySetInnerHTML={{
								__html: highlightPowerShell(value) + "\n",
							}}
						/>

						<textarea
							ref={textareaRef}
							value={value}
							onChange={(e) => onChange(e.target.value)}
							onScroll={syncScroll}
							spellCheck={false}
							className="relative z-10 h-64 w-full resize-none bg-transparent p-3 font-mono text-xs leading-6 text-transparent caret-zinc-100 outline-none"
							placeholder="# Enter your PowerShell script here..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
