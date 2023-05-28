import { CustomNotFoundException, CustomisableException } from "../../exceptions/custom.exceptions";

export enum BlogActionResult {
    Success = 'SUCCESS',
    BlogNotFound = 'BLOG_NOT_FOUND',
    UserNotFound = 'USER_NOT_FOUND',
    PostNotFound = 'POST_NOT_FOUND',
    NotOwner = 'CURRENT_USER_IS_NOT_OWNER',
    UserAlreadyBound = 'USER_ALREADY_BOUND',
    UserAlreadyBanned = 'USER_ALREADY_BANNED',
    UserNotBanned = 'USER_NOT_BANNED',
    NotSaved = 'CHANGES_NOT_SAVED',   
    NotCreated = 'NOT_CREATED', 
    NotDeleted = 'NOT_DELETED', 
  }

  export function handleBlogOperationResult(result: BlogActionResult) {
    if (!Object.values(BlogActionResult).includes(result)) {
      return;
    }
    switch (result) {
      case BlogActionResult.Success:
        break;
      case BlogActionResult.UserAlreadyBanned:
        break;
      case BlogActionResult.UserNotBanned:
        break;
      case BlogActionResult.BlogNotFound:
        throw new CustomNotFoundException('blog')
      case BlogActionResult.PostNotFound:
        throw new CustomNotFoundException('post') 
      case BlogActionResult.UserNotFound:
        throw new CustomNotFoundException('user')  
      case BlogActionResult.UserAlreadyBound:
        throw new CustomisableException('blogId', 'current blog already bound', 400)
      case BlogActionResult.UserNotFound:
        throw new CustomNotFoundException('user')
      case BlogActionResult.NotSaved:
        throw new CustomisableException('can\'t save', 'failed to save changes', 500)
      case BlogActionResult.NotOwner:
        throw new CustomisableException('not owner', 'users cannot change data unless they are the owner', 403)
      case BlogActionResult.NotCreated:
        throw new CustomisableException('can\'t create', 'failed to create new doccument', 500)  
      case BlogActionResult.NotDeleted:
        throw new CustomisableException('can\'t delete', 'failed to delete this doccument', 500)  
      
      default:
        throw new CustomisableException('unexpected', 'An unexpected error occurred', 400)       
    }
  }