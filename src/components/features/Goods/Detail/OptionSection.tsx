import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { VscHeart } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';

import { CountOptionItem } from './OptionItem/CountOptionItem';

import { type ProductDetailRequestParams, useGetProductDetail } from '@/api/hooks/useGetProductDetail';
import { useGetProductOptions } from '@/api/hooks/useGetProductOptions';
import { usePostWishs } from '@/api/hooks/usePostWishs';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/provider/Auth';
import { getDynamicPath, RouterPath } from '@/routes/path';
import type { WishListData } from '@/types';
import { orderHistorySessionStorage, wishListSessionStorage } from '@/utils/storage';

type Props = ProductDetailRequestParams;

export const OptionSection = ({ productId }: Props) => {
  const { data: detail } = useGetProductDetail({ productId });
  const { data: options } = useGetProductOptions({ productId });

  const [countAsString, setCountAsString] = useState('1');
  const totalPrice = useMemo(() => {
    return detail.price * Number(countAsString);
  }, [detail, countAsString]);

  const navigate = useNavigate();
  const authInfo = useAuth();

  const likeCount = 36293;
  const { mutate: postWishs } = usePostWishs();

  const handleClick = () => {
    if (!authInfo) {
      const isConfirm = window.confirm('로그인이 필요한 메뉴입니다.\n로그인 페이지로 이동하시겠습니까?');

      if (!isConfirm) return;
      return navigate(getDynamicPath.login());
    }

    orderHistorySessionStorage.set({
      id: parseInt(productId),
      count: parseInt(countAsString),
    });

    navigate(RouterPath.order);
  };

  const handleWishClick = () => {
    if (!authInfo) {
      const isConfirm = window.confirm('로그인이 필요한 메뉴입니다.\n로그인 페이지로 이동하시겠습니까?');

      if (!isConfirm) return;
      return navigate(getDynamicPath.login());
    }
    const currentWishList: WishListData[] = wishListSessionStorage.get() || [];
    const newWishItem: WishListData = {
      id: detail.id,
      product: {
        id: detail.id,
        name: detail.name,
        price: detail.price,
        imageUrl: detail.imageUrl,
      },
    };
    postWishs(Number(productId), {
      onSuccess: () => {
        const addWishList = [...currentWishList, newWishItem];
        wishListSessionStorage.set(addWishList);
        alert('관심 등록 완료');
      },
      onError: (error) => {
        console.error('Error:', error);
      },
    });
  };

  return (
    <Wrapper>
      <CountOptionItem name={options[0].name} value={countAsString} onChange={setCountAsString} />
      <BottomWrapper>
        <PricingWrapper>
          총 결제 금액 <span>{totalPrice}원</span>
        </PricingWrapper>
        <ButtonWrapper>
          <CustomButton onClick={handleWishClick}>
            <VscHeart size={30} />
            <span>{likeCount}</span>
          </CustomButton>
          <Button theme="black" size="large" onClick={handleClick}>
            나에게 선물하기
          </Button>
        </ButtonWrapper>
      </BottomWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  padding: 30px 12px 30px 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const BottomWrapper = styled.div`
  padding: 12px 0 0;
`;

const PricingWrapper = styled.div`
  margin-bottom: 20px;
  padding: 18px 20px;
  border-radius: 4px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;

  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  color: #111;

  & span {
    font-size: 20px;
    letter-spacing: -0.02em;
  }
`;
const ButtonWrapper = styled.div`
  display: flex;
  gap: 2px;
`;

const CustomButton = styled(Button)`
  width: 30%;
  display: flex;
  flex-direction: column;
  font-size: 18px;
  height: 40px;
  background-color: #444;
  color: #fff;
  &:hover {
    background-color: #444;
  }
`;
