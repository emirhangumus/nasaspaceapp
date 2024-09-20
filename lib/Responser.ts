type ResponserProps<T> = {
  message: string;
} & (
  | {
      success: false;
      data: null;
    }
  | {
      success: true;
      data: T;
    }
);

export type ResponserReturn = {
  success: boolean;
  message: string;
  data: any;
};

export const Responser = <T>({
  success,
  message,
  data,
}: ResponserProps<T>): ResponserReturn => {
  return {
    success,
    message,
    data,
  };
};
