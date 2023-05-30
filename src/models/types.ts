export type RequestQueryParamsModel = {
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
};

export const DEFAULT_QUERY_PARAMS: RequestQueryParamsModel = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: '1',
  pageSize: '10',
};

export type RequestBlogsQueryModel = {
  searchNameTerm: string;
} & RequestQueryParamsModel;

export const DEFAULT_BLOGS_QUERY_PARAMS: RequestBlogsQueryModel = {
  searchNameTerm: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: '1',
  pageSize: '10',
};

export type RequestBannedUsersQueryModel = RequestQueryParamsModel & {
  searchLoginTerm: string;
}
export const DEFAULT_BANNED_USERS_QUERY_PARAMS: RequestBannedUsersQueryModel = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: '1',
  pageSize: '10',
  searchLoginTerm: ''
};

export type RequestUsersQueryModel = RequestQueryParamsModel & {
  
  searchLoginTerm: string;
  searchEmailTerm: string;
  banStatus: string;
};

export const DEFAULT_USERS_QUERY_PARAMS: RequestUsersQueryModel = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: '1',
  pageSize: '10',
  searchLoginTerm: '',
  searchEmailTerm: '',
  banStatus: 'all'
};





export type PaginationOutputModel<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};
