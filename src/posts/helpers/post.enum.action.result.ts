import { ForbiddenException } from "@nestjs/common";
import { CustomNotFoundException, CustomisableException } from "../../exceptions/custom.exceptions";

export enum PostActionResult {
    Success = 'SUCCESS',
    BlogNotFound = 'BLOG_NOT_FOUND',
    UserNotFound = 'USER_NOT_FOUND',
    PostNotFound = 'POST_NOT_FOUND',
    UserBannedForBlog = 'USER_BANNED_FOR_BLOG',
    NotOwner = 'CURRENT_USER_IS_NOT_OWNER',
    NotSaved = 'CHANGES_NOT_SAVED',   
    NotCreated = 'NOT_CREATED', 
    NotDeleted = 'NOT_DELETED', 
  }

  export function handlePostActionResult(result: PostActionResult) {
    if (!Object.values(PostActionResult).includes(result)) {
      return;
    }
    switch (result) {
      case PostActionResult.Success:
        break;
      case PostActionResult.BlogNotFound:
        throw new CustomNotFoundException('blog')
      case PostActionResult.PostNotFound:
        throw new CustomNotFoundException('post') 
      case PostActionResult.UserNotFound:
        throw new CustomNotFoundException('user')  

      case PostActionResult.NotOwner:
        throw new CustomisableException('not owner', 'users cannot change data unless they are the owner', 403)

      case PostActionResult.UserBannedForBlog:
        throw new ForbiddenException('banned user can\'t add comment')  

      case PostActionResult.NotCreated:
        throw new CustomisableException('can\'t create', 'failed to create new doccument', 500) 
      case PostActionResult.NotSaved:
        throw new CustomisableException('can\'t save', 'failed to save changes', 500)  
      case PostActionResult.NotDeleted:
        throw new CustomisableException('can\'t delete', 'failed to delete', 500) 
        
      
      default:
        throw new CustomisableException('unexpected', 'An unexpected error occurred', 400)       
    }
  }