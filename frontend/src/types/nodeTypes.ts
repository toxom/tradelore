export interface IcicleNode {
    name: string;
    children?: IcicleNode[];
    value?: number;
  }
  
  export interface IcicleData {
    name: string;
    children: IcicleNode[];
  }