import React from 'react';
import { PacmanLoader } from 'react-spinners';

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    render() {
        return (
            <div>
                <PacmanLoader
                    sizeUnit={"px"}
                    css={`
                    margin: 60px;
                    display: block;
                    left: 40%;
                    `}
                    size={40}
                    color={'#336573'}
                />
                <h1>Welcome to Xephiz.Dev</h1>
                <h2>This site is still under construction</h2>
            </div>
        )
    }
}