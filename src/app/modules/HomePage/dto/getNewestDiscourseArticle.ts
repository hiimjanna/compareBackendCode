import { ApiProperty } from "@nestjs/swagger";

export class DiscourseArticle{
  @ApiProperty({ example: '[新聞]微軟最大收購案...', description: 'discourse文章標題' })
  articleName: string;
  @ApiProperty({ example: 'lakyfang', description: '該篇文章的作者' })
  author: string;
  @ApiProperty({ example: 'https://discourse.i17game.net/t/topic/1339', description: '該篇文章的連結' })
  articleUrl: string;
}

export class GetNewestDiscourseArticleRespDTO {
  @ApiProperty({ example: 0, description: '0為成功運行，1為有尋找到重複資料，-1為其他錯誤' })
  status: number;
  @ApiProperty({ type: DiscourseArticle , description: 'Object包含文章標題、作者(順序由最近到最遠)' })
  discourseArticleList: Array<DiscourseArticle>;
}

export class GetNewestDiscourseArticleReqDTO {
  @ApiProperty({ example: 6, description: '輸入獲取最近的幾筆資料(預設為6筆)', required: false })
  count: number;
}