import { CustomNotFoundException, CustomisableException } from "src/exceptions/custom.exceptions";

export enum BlogActionResult {
    Success = 'SUCCESS',
    BlogNotFound = 'BLOG_NOT_FOUND',
    UserAlreadyBound = 'USER_ALREADY_BOUND',
    UserNotFound = 'USER_NOT_FOUND',
    PostNotFound = 'POST_NOT_FOUND',
    NotSaved = 'CHANGES_NOT_SAVED',
    NotOwner = 'CURRENT_USER_IS_NOT_OWNER',
    NotCreated = 'NOT_CREATED',   
  }

  export function handleBlogOperationResult(result: BlogActionResult) {
    if (!Object.values(BlogActionResult).includes(result)) {
      return;
    }
    switch (result) {
      case BlogActionResult.Success:
        break;
      case BlogActionResult.BlogNotFound:
        throw new CustomNotFoundException('blog')
      case BlogActionResult.PostNotFound:
        throw new CustomNotFoundException('post')  
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
      default:
        throw new CustomisableException('unexpected', 'An unexpected error occurred', 400)       
    }
  }