import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { FeedbackDto } from './dto/feedback.dto';

@ApiTags('师徒匹配')
@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('recommendations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的推荐结果' })
  getRecommendations(@Req() req: any) {
    return this.matchingService.getRecommendations(req.user.userId);
  }

  @Post('feedback/:matchId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交匹配反馈' })
  submitFeedback(
    @Param('matchId') matchId: string,
    @Body() dto: FeedbackDto,
    @Req() req: any,
  ) {
    return this.matchingService.submitFeedback(matchId, req.user.userId, dto.status);
  }

  @Post('run')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动触发匹配（测试用）' })
  runMatching() {
    return this.matchingService.runMatching();
  }
}
