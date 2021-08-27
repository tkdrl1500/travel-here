import { useEffect, useRef, useState } from "react";
import * as S from "./WriteModal.style";
import { dbService, storageService } from "firebase.js";
import { v4 as uuidv4 } from "uuid";
import firebase from "firebase";
import { userMiddleware } from "store/modules/userLike";
import { useDispatch } from "react-redux";
import UpdateModal from "./UpdateModal";
import { useMediaQuery } from "react-responsive";

export default function WriteModal({ visible, isVisible, postData }) {
  const [post, setPost] = useState("");
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [attachment, setAttachment] = useState([]);
  const [login, setLogin] = useState("");
  const postRef = useRef();
  const titleRef = useRef();
  const auth = firebase.auth();
  const dispatch = useDispatch();
  const isHeight = useMediaQuery({ maxHeight: 765 });

  const onChange = (e) => {
    const { value, name } = e.target;
    if (name === "textarea") {
      setPost(value);
    } else if (name === "region") {
      setRegion(value);
    } else if (name === "title") {
      setTitle(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let attachmentUrl = [];
    if (attachment) {
      for (let i = 0; i < attachment.length; i++) {
        const attachmentRef = storageService
          .ref()
          .child(`${login.uid}/${uuidv4()}`);
        const response = await attachmentRef.putString(
          attachment[i],
          "data_url"
        );
        attachmentUrl.push(await response.ref.getDownloadURL());
      }
    }

    const ID = login.uid;
    const uuid = uuidv4();

    // users collection의 user_write_posts에 post_id 추가
    await dbService
      .collection("users")
      .doc(ID)
      .update({
        user_write_posts: firebase.firestore.FieldValue.arrayUnion(uuid),
      });

    await dbService.collection("post").doc(uuid).set({
      post_title: title,
      post_content: post,
      post_writer: login.displayName,
      post_uid: login.uid,
      post_date: Date.now(),
      post_id: uuid,
      post_photo: attachmentUrl,
      post_profile_img: login.photoURL,
      post_region: region,
      post_view: 0,
      post_like: 0,
      post_update: false,
    });
    setPost("");
    setTitle("");
    setRegion("");
    setAttachment([]);
    isVisible();
  };

  const onFileChange = (e) => {
    const { files } = e.target;
    let file;
    let fileURLs = [];

    for (let i = 0; i < files.length; i++) {
      file = files[i];
      let reader = new FileReader();
      reader.onload = () => {
        fileURLs[i] = reader.result;
        setAttachment([...fileURLs]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onClearAttachmentClick = () => {
    setAttachment(null);
  };

  const removeAttachment = (e) => {
    setAttachment((prev, index) => {});
  };

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setLogin(user);
      dispatch(userMiddleware(user.uid, "", "init"));
    });
  }, []);
  return (
    <>
      {postData ? (
        <UpdateModal
          visible={visible}
          isVisible={isVisible}
          postData={postData}
          login={login}
          isHeight={isHeight}
        />
      ) : (
        <>
          <S.Overlay visible={visible} onClick={isVisible} />
          <S.Container visible={visible} isHeight={isHeight}>
            <i onClick={isVisible} className="fas fa-times" />

            {login && (
              <S.Wrapper>
                <img src={login.photoURL} alt="" />
                <S.Name> {login.displayName}</S.Name>
              </S.Wrapper>
            )}
            <form onSubmit={onSubmit}>
              <input
                name="title"
                type="text"
                ref={titleRef}
                onChange={onChange}
                placeholder="제목을 입력해 주세요."
              />
              <textarea
                name="textarea"
                ref={postRef}
                onChange={onChange}
                placeholder="내용을 입력해주세요."
                rows="10"
              />
              <select name="region" onChange={onChange}>
                <option selected value="">
                  지역을 선택해 주세요.
                </option>
                <option value="asia">Asia</option>
                <option value="north_america">North America</option>
                <option value="south_america">South America</option>
                <option value="africa">Africa</option>
                <option value="europe">Europe</option>
                <option value="australia">Australia</option>
                <option value="antarctica">Antarctica</option>
              </select>
              <input
                multiple
                accept="image/*"
                type="file"
                onChange={onFileChange}
                name="fileNames[]"
              />
              <div>
                {attachment &&
                  attachment.map((atta, i) => (
                    <img key={i} src={atta} width="70px" height="70px" alt="" />
                  ))}
              </div>
              <input
                type="button"
                value="이미지 모두 삭제"
                onClick={onClearAttachmentClick}
              />
              <input type="submit" value="등록" />
            </form>
          </S.Container>
        </>
      )}
    </>
  );
}
