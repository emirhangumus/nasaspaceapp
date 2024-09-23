type ResponserProps<T> = {
  message: string;
  data: T;
  success: boolean;
};

export type ResponserReturn<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const Responser = <T>({
  success,
  message,
  data,
}: ResponserProps<T>): ResponserReturn<T> => {
  return {
    success,
    message,
    data,
  };
};
