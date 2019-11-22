interface Style {
  moduleId: string;
  css: string;
  media: string;
  sourceMap: any;
}

interface InsertCssOption {
  replace: boolean;
  prepend: boolean;
  prefix: string;
}

declare interface InsertCss {
  (style: Style, option: InsertCssOption): (ids: string[]) => void;
}

export default InsertCss;
