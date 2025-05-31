import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class Comment {
  @Field(() => ID)
  commentId: string;

  @Field(() => ID)
  docId: string;

  @Field()
  text: string;

  @Field()
  author: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  rangeStart: number;

  @Field()
  rangeEnd: number;
}

@InputType()
export class CommentInput {
  @Field()
  text: string;

  @Field()
  author: string;

  @Field()
  rangeStart: number;

  @Field()
  rangeEnd: number;
}

@ObjectType()
export class CommentEvent {
  @Field()
  type: string; // 'ADD', 'UPDATE', 'DELETE'

  @Field(() => Comment, { nullable: true })
  comment?: Comment;

  @Field({ nullable: true })
  commentId?: string;

  @Field(() => ID, { nullable: true }) // Added docId for DELETE events
  docId?: string;
}
