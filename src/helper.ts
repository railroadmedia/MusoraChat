const formatTypers = (typers: string[]): string => {
  if (!typers.length) {
    return '';
  }
  const firstTwo = typers.slice(0, 2).join(typers.length < 3 ? ' And ' : ', ');
  const remaining = typers.slice(2, typers.length);
  const remainingStr = remaining.length
    ? ` And ${remaining.length} Other${remaining.length === 1 ? '' : 's'}`
    : '';
  const endString = ` ${typers.length < 2 ? 'Is' : 'Are'} Typing`;
  return firstTwo + remainingStr + endString;
};

export { formatTypers };
