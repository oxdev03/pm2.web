export const enum AuthErrors {
    InvalidForm = "InvalidForm",
    InvalidRegistrationCode = "InvalidRegistrationCode",
    AccountExists = "AccountExists",
    UnauthorizedRegister = "UnauthorizedRegister",
    OAuth2Linked = "OAuth2Linked",
    Unauthorized = "Unauthorized",
    IncorrectPassword = "IncorrectPassword",
    NotRegistered = "NotRegistered",
    Default = "Default"
}

export const AuthErrorMessages: Record<AuthErrors, string> = {
    [AuthErrors.InvalidForm]: "The provided credentials are invalid or incomplete.",
    [AuthErrors.InvalidRegistrationCode]: "The registration code is invalid or does not match.",
    [AuthErrors.AccountExists]: "An account with this email or username already exists.",
    [AuthErrors.UnauthorizedRegister]: "Account registered successfully. Found no access permission, this needs to be assigned by the Owner/Admin",
    [AuthErrors.OAuth2Linked]: "This account is already linked to an OAuth2 provider.",
    [AuthErrors.Unauthorized]: "You do not have sufficient permissions to access this resource.",
    [AuthErrors.IncorrectPassword]: "The password provided is incorrect.",
    [AuthErrors.NotRegistered]: "No account was found for the provided email address.",
    [AuthErrors.Default]: "Unable to SignIn"
};