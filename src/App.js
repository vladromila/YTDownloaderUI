import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
class App extends Component {
    constructor() {
        super();
        this.state = {
            videos: [],
            svideos: [],
            input: '',
            sinput: ''
        };
        this.timeout = 0;
        this.height = 0;
        this.listheight=0;
    }
    componentDidMount() {
        this.height = this.divelement.scrollHeight;
        this.listheight=this.listdiv.scrollHeight;
    }
    componentDidUpdate() {
        this.height = this.divelement.scrollHeight;
    }
    checkR(wVideo) {
        let k = 0;
        this.state.videos.map(video => {
            if (video.url === wVideo.url || video.title === wVideo.title)
                k++;
        })
        return k == 0;
    }
    ytSearch(e) {
        this.setState({ sinput: e.target.value })

        if (this.timeout) clearTimeout(this.timeout);
        if (e.target.value === '')
            this.setState({ svideos: [] })
        else
            this.timeout = setTimeout(() => {
                let params = {
                    part: 'snippet',
                    key: 'AIzaSyAjOSC1vpGqhmNcC9FauahEv4U2OOR3fI0',
                    q: this.state.sinput,
                    type: 'video',
                    maxResults: 25
                };

                axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: params
                })
                    .then(res => res.data.items.forEach((video, i) => {
                        let data = {
                            url: `https://www.youtube.com/watch?v=${video.id.videoId}`
                        }
                        fetch('http://localhost:1234/get-title', {
                            method: "POST",
                            mode: "cors",
                            headers: {
                                'Content-Type': 'application/json',
                                'Origin': '*',
                                'Access-Control-Allow-Headers': '*',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify(data)
                        }
                        ).then(res => res.json())
                            .then(res => {
                                const { svideos } = this.state;
                                let title = res.title.replace(new RegExp("/", 'g'), ' ').replace(/\|/g, "");
                                let videodata = {
                                    url: data.url,
                                    title: title,
                                    thumbnail: res.thumbnail
                                };
                                svideos[i] = videodata; if (this.state.sinput !== '') {
                                    this.setState({ svideos: svideos })
                                }
                            })
                    }))
            }, 500);
    }
    render() {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
                <div id="style-2" style={{ width: '30%', height: this.state.svideos.length === 0 ? "100%" : `${this.height}px`, textAlign: 'center', overflowX: 'hidden', overflowY:this.height<=this.listheight?'hidden':'scroll', }}>
                    <div id="list" ref={(listdiv)=>this.listdiv=listdiv }>
                        {this.state.videos.map((video, i) => {
                            return <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <img src={video.thumbnail} style={{ position: 'relative', left: 0 }} />
                                <h4 style={{ paddingLeft: 15 }}>{video.title}</h4>
                            </div>
                        })}
                    </div>
                </div>

                <div style={{ width: '70%', textAlign: 'center' }} id="secdiv" ref={divelement => this.divelement = divelement}>
                    {this.state.videos.length > 0 ? <button
                        onClick={() => {
                                let data = {
                                    videos: this.state.videos
                                };
                                fetch('http://localhost:1234/createmp3', {
                                    method: "POST",
                                    mode: "cors",
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Origin': '*',
                                        'Access-Control-Allow-Headers': '*',
                                        'Access-Control-Allow-Origin': '*',
                                    },
                                    body: JSON.stringify(data)
                                })

                        }}
                    >Trimite</button> : null}
                    <div id="namer">
                        <div id="namer-input">
                            <input onChange={e => {
                                this.ytSearch(e);
                            }
                            } type="text" name="namername" placeholder="Youtube Search" />
                        </div>
                        <ul class="card-list">
                            {this.state.svideos.map((video, i) => {
                                return <li class="card" onClick={() => {
                                    let { videos } = this.state;
                                    if (this.checkR(video) === true) {
                                        videos.push(video);
                                        this.setState({ videos: videos });
                                    }
                                    else {
                                        let index = videos.indexOf(video);
                                        if (index > -1)
                                            videos.splice(index, 1);
                                        this.setState({ videos: videos });
                                    }
                                }}>
                                    <div class="card-image" style={{ backgroundImage: `url(${video.thumbnail})` }} />
                                    <div class="card-description" style={this.checkR(video) == false ? { backgroundColor: '#7FFFD4' } : null}>
                                        <h4>{video.title}</h4>
                                    </div>
                                </li>
                            })}
                        </ul>
                        <div id="namer-input">
                            <input value={this.state.input} onChange={(e) => { this.setState({ input: e.target.value }) }} type="text" name="namername" placeholder="Youtube URL" />
                        </div>
                        <div className="namer-controls">
                            <div onClick={() => {
                                let data = {
                                    url: this.state.input
                                };
                                fetch('http://localhost:1234/get-title', {
                                    method: "POST",
                                    mode: "cors",
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Origin': '*',
                                        'Access-Control-Allow-Headers': '*',
                                        'Access-Control-Allow-Origin': '*',
                                    },
                                    body: JSON.stringify(data)
                                }
                                ).then(res => res.json())
                                    .then(res => {
                                        const { videos } = this.state;
                                        let title = res.title.replace(new RegExp("/", 'g'), ' ').replace(/\|/g, "");
                                        videos.push(
                                            {
                                                url: data.url,
                                                title: title,
                                                thumbnail: res.thumbnail
                                            })
                                        this.setState({ videos: videos, input: '' })
                                    })
                            }}><span>Adauga</span></div>
                        </div>
                        <ul>

                        </ul>
                    </div>
                    <div>

                    </div>
                </div>
            </div>
        );
    }
}

export default App;
