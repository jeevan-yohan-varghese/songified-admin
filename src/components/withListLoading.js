import React from 'react'

function WithListLoading(Component){
    return function WithLoadingComponent({isLoading,...props}){
        if(!isLoading) return <Component {...props}/>;
        return(
            <p>Loading comments from users...</p>
        );
    };
}

export default WithListLoading;