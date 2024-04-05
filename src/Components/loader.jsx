import React from 'react';
import { BeatLoader} from 'react-spinners';
class Loading extends React.Component{
    constructor(props){
        super(props);
        this.state={
         type:this.props.type
        };

    }
    
    render(){
        return(
            <div className={this.props.type==='individual1'?('loaderInd1'):(this.props.type==='individual2'?('loaderInd2'):('loader'))}>
                <BeatLoader size={18} color='#306fceed' loading />
            </div>
        // <div>
        //     <div className='spinner spinner-slow'>
        //     </div>
        // </div>
        )
    }
}
export default Loading;