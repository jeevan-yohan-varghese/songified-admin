import React from 'react';
const List = (props) => {
    const { comments } = props;
    if (!comments || comments.length === 0) return <p>No data found !</p>;
    return (
        <ul>
            <h3>User Comments</h3>

            {comments.map((comment) => {
                return (
                    <li key={comment._id}>
                        <div className='comment_container'>
                            <p className="user_name">Posted by : {comment.name}</p>
                            <p className="song_id">#{comment.songId} {comment.detail}</p>
                            <p className="comment_detail">{comment.songName}</p>
                            <div class="btn_container">


                                {comment.verified ?
                                    <button className="btn btn_unverify" onClick={() => props.unVerifyFunc(comment._id)}>UNVERIFY</button>
                                    : <button className="btn btn_verify" onClick={() => props.verifyFunc(comment._id)}>VERIFY</button>
                                }
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default List;