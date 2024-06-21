
export const AuthManager =(
    state = {signed : false},
    action
) =>{
    switch (action.type){
        case "SIGNIN":
            return{
                ...action.payload,
                signed:true,
                role: action.role,
            }
            break;
        case "SIGNOUT":
            return{
                signed:false
            }
            break;
        default:
            return state;

    }
}