import { ApiProperty } from "@nestjs/swagger";
export class Post_Type {
    @ApiProperty({required:true,
        example:"testekonsi"
    })
    user: string 
    @ApiProperty({required:true,
    example:"testekonsi"
    })
    password: string ;
    @ApiProperty({required:true,
       example: "537.103.555-91,105.237.665-72,385.381.135-34,247.109.625-53,135.171.985-87,981.293.925-34,037.448.925-49,515.646.965-53,089.319.255-49,111.194.895-04",
       description:"Lista de 1 ou mais cpf(s) separados por virgula"
    
    
    })
    cpfs: string
    @ApiProperty({required:false,
        example:300,
        description:"Tempo entre cada step do Crowler"
    })
    interval: number
}