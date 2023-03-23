export const apiRouteDefault: string = 'apiRoutes.qrequestable.comments';
export const commentableTypeDefault: string = 'Modules\\Requestable\\Entities\\Requestable';
export const permissionsCommentsDefault: String = 'icomments.comments';

export interface PermissionsCommentsContract {
    create: string;
    edit: string;
    index: string;
    destroy: string;
}
export const commentModelConst: CommentModelContract = {
    text: "",
    textEdit: "",
    active: false,
    user: "",
    loading: false,
    avatar:
        "https://dev-gestionhc.ozonohosting.com/modules/iprofile/img/default.jpg",
}
export interface CommentModelContract {
    text: string | null;
    textEdit: string;
    active: boolean;
    user: string;
    loading: boolean;
    avatar: string;
}
export interface EditorConfigContract {
    height: number;
}

export interface commentsContract {
    approved: boolean;
    comment: string | null;
    commentableId: number;
    commentableType: string;
    createdAt: string;
    createdBy: number;
    deletedAt?: any | Date;
    deletedBy?: any;
    id: number;
    is_internal: number;
    options?: any;
    updatedAt: string;
    updatedBy: number;
    userId: number;
    userProfile: UserProfileContract;
    active: boolean;
    loading: boolean;
    textEdit: string | null;
    edit: boolean;
}

export interface UserProfileContract {
    email: string;
    password: string;
    permissions: any;
    allSettings: any;
    socialData: any;
    defaultInclude: string;
    allPermissions: any;
    crudPermissions?: any;
    lastLogin: string;
    fullName: string;
    firstName: string;
    lastName: string;
    timezone?: any;
    language?: any;
    createdBy?: any;
    updatedBy?: any;
    deletedBy?: any;
    externalGuid?: any;
    roles: any[];
    departments: any[];
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: any;
    externalId?: any;
    options: Options;
    searchableFields: string;
    fileFormats?: any;
}

export interface Options {
    buildingsAssigned: any[];
    businessUnitType: string;
    stationsAssigned: any[];
}
