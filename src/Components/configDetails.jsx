import React, { Component } from 'react';

class ConfigDetailsPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      showContent: true,
      currentResultIndex: -1,
      filteredConfigDetails:null,
      nextInstance:null,
      isSearching:false,
    };
  }

  renderHighlight = (text, query) => {
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.split(regex).map((part, index) =>
        regex.test(part) ? (
          <mark className="highlighted" style={{ backgroundColor: '#e3959582' }} key={index}>
            {part}
          </mark>
        ) : (
          part
        )
      );
    } else {
      return text;
    }
  };

  handleResultNavigation = (direction) => {
    const { filteredConfigDetails, currentResultIndex } = this.state;
    const numResults = filteredConfigDetails.length;
    if(filteredConfigDetails === null ){
      alert("Enter Search Content");
    }
    let newIndex;
    console.log(filteredConfigDetails,'cc')
    if (numResults > 0) {
      if (direction === 'up') {
        newIndex = (currentResultIndex - 1 + numResults) % numResults;
      } else if (direction === 'down') {
        newIndex = (currentResultIndex + 1) % numResults;
        this.setState({nextInstance:newIndex})
        console.log(newIndex,"newwwwwwwwww")
      }

      this.setState({ currentResultIndex: newIndex }, () => {
        // After updating the index, focus on the corresponding element
        const highlightedElement = document.getElementById(`result-${newIndex}`);
        console.log('set current index',highlightedElement,currentResultIndex,this.state.nextInstance)
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchQuery !== this.state.searchQuery) {
      const { configDetails } = this.props;
      const { searchQuery } = this.state;
      const configArray = Object.values(configDetails);
  
      const filteredConfigDetails = configArray.filter((detail) =>
        JSON.stringify(detail).toLowerCase().includes(searchQuery.toLowerCase())
      );
  
      this.setState({ filteredConfigDetails });
    }
  }

  render() {
    const { configDetails } = this.props;
    const { searchQuery ,nextInstance} = this.state;
    const configArray = Object.values(configDetails);

    const filteredConfigDetails = configArray.filter(detail =>
      JSON.stringify(detail).toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log(filteredConfigDetails,'fuhdfiudyfiusdhyfuisyhf')

    return (
      <div>
      {this.state.showContent ? (
        <div className="PopUpConfigDetails" style={{ position: 'fixed', top: '27%', minHeight : '150px', maxHeight: '437px',width:'47%', overflowY: 'scroll', zIndex: 9999 }}>
          <div>
            <button onClick={this.props.closePopup} className='closeConfigPopup'></button>
            <div className='searchBar'>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => {
                const isSearching = e.target.value.trim() !== '';
                this.setState({
                  searchQuery: e.target.value,
                  currentResultIndex: -1,
                  isSearching: isSearching,
                });
              }}              
              onKeyDown={this.handleKeyDown}
              style={{ fontSize: '16px', padding: '5px', borderRadius:'10px', marginRight:'10px' }}
              ref={input => (this.searchInput = input)} // Add this line
            />
            <button disabled={!this.state.isSearching} onClick={() => this.handleResultNavigation('up')}>▲</button>&nbsp;
            <button disabled={!this.state.isSearching}onClick={() => this.handleResultNavigation('down')}>▼</button>
            {filteredConfigDetails.length === 0 ? (
              <div>
                <p style={{ fontSize: '14px', color: '#888' }}>No matching results found.</p>
              </div>
              
            ) : (
              <div> 
                {this.state.isSearching ? (<p style={{ fontSize: '14px' }}>
                  {filteredConfigDetails.reduce((count, detail) => {
                    const jsonString = JSON.stringify(detail, null, 2).toLowerCase();
                    const query = searchQuery.toLowerCase();
                    const matches = (jsonString.match(new RegExp(query, 'g')) || []).length;
                    return count + matches;
                  }, 0)} matching results found.
                </p>) : (null)}
              </div>
            )}
            </div>
            
          </div>
          
          {filteredConfigDetails.length>0 && filteredConfigDetails.map((detail, index) => (
                  <div
                    key={index}
                    id={`result-${index}`} // Add this id
                    className={`highlighted-content ${this.state.currentResultIndex === index ? 'highlighted-row' : ''}`}
                  >
                    <pre style={{ fontSize: '14px' }}>{this.renderHighlight(JSON.stringify(detail, null, 2), searchQuery)}</pre>
                  </div>
                ))}
        </div>
      ) : null}
    </div>
    );
  }
}

export default ConfigDetailsPopup;