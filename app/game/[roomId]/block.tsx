import { Room } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function BlockContent({ letter, words, activeLetter, lastUsedWord }: {
  letter: string;
  words: Room['words'][string],
  activeLetter: string,
  lastUsedWord: string
}) {
  const shouldUseColumns = words.length > 10;

  return (
    <div
      key={letter}
      className={`bg-gray-800 break-inside-avoid-column  mb-4 p-3 sm:p-4 rounded-lg ${letter === activeLetter ? 'ring-2 ring-secondary' : ''}
      h-auto flex flex-col`}
    >
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <h2 className="text-lg sm:text-xl font-semibold">{letter}</h2>
        <Badge variant="default">{words.length}</Badge>
      </div>
      <div className="flex-grow overflow-auto">
        <ul className={`space-y-1 text-xs sm:text-sm ${shouldUseColumns ? 'columns-2 gap-x-4' : ''}`}>
          {words?.map(({ word, meaning }, index) => (
            <li key={index} className={`break-inside-avoid-colum`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className={`text-left ${lastUsedWord === word ? 'text-yellow-400' : ''}`}>{word}</TooltipTrigger>
                  <TooltipContent>
                    <p>{meaning}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}