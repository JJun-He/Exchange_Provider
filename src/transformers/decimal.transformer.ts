import { ValueTransformer } from "typeorm";


export class DecimalToStringTransformer implements ValueTransformer{
    // 데이터베이스에 저장할 때
    to(value: string | number | null | undefined): string | null {
        if(value === null || value === undefined){
            return null;
        }
        
        // number가 들어온 경우 string으로 변환
        if(typeof value === 'number'){
            return value.toString();
        }

        return value;
    }

    // 데이터베이스에서 읽어올 때
    from(value: string | null): string | null {
        return value;
    }
}

export const decimalTransformer = new DecimalToStringTransformer();