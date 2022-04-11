import React from 'react';
import Header from "./Header";

const Layout = (props) => {
    return (
        <div>
            <Header />
            {props.children}
            <h2>Footer</h2>
        </div>
    )
}

export default Layout;