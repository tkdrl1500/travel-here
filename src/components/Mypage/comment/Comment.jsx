﻿import React from 'react';
import * as S from "./Comment.style";
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';


const Comment = ({ user }) => {

  const commentDB = useSelector(state => state.mypageComment.data);

  const history = useHistory();

  const check = commentDB.length === 0;

  const onMovePage =(post) => {
    history.push({
      pathname: `/categorylist/${post.post_region}`,
      search: `?id=${post.post_id}`,
      state: {
        like: user.user_like_posts,
        bookmark: user.user_bookmark_posts,
        postData: post,
        profile: user.user_image,
      }
    });
  }


  return(
    <>
      {!check && commentDB.map((com) => {
        return(
        <S.List key={com.comment_id} onClick={()=>{onMovePage(com)}} title={'게시글 보러가기'}>
          <p>{com.comment_content}</p>
        </S.List>
        )
      })}
      {check &&
        <S.Null>작성한 댓글이 없습니다</S.Null>
      }
    </>
  )
}

export default Comment;