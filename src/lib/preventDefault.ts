export const preventDefault = (e: React.DragEvent<HTMLDivElement>): void => {
  e.preventDefault();
  e.stopPropagation();
};
