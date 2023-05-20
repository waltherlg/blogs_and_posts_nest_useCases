import { CustomNotFoundException, CustomisableException } from "src/exceptions/custom.exceptions";

export enum BlogActionResult {
    Success = 'SUCCESS',
    BlogNotFound = 'BLOG_NOT_FOUND',
    UserAlreadyBound = 'USER_ALREADY_BOUND',
    UserNotFound = 'USER_NOT_FOUND',
    NotSaved = 'CHANGES_NOT_SAVED',
    NotOwner = 'CURRENT_USER_IS_NOT_OWNER',   
  }

  export function handleBlogOperationResult(result: BlogActionResult) {
    switch (result) {
      case BlogActionResult.Success:
        break;
      case BlogActionResult.BlogNotFound:
        throw new CustomNotFoundException('blog')
      case BlogActionResult.UserAlreadyBound:
        throw new CustomisableException('blogId', 'current blog already bound', 400)
      case BlogActionResult.UserNotFound:
        throw new CustomNotFoundException('user')
      case BlogActionResult.NotSaved:
        throw new CustomisableException('blog', 'failed to save changes', 500)
      case BlogActionResult.NotOwner:
        throw new CustomisableException('blog', 'users cannot make changes if they do not own the blog', 403)
      default:
        throw new CustomisableException('unexpected', 'An unexpected error occurred', 400)       
    }
  }