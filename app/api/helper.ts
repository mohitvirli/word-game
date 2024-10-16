
export function generateAvatarUrl(name: string) {
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${hash}`;
}