import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
       return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productInCart = cart.find(product => product.id === productId);
      if (productInCart){
        const newCart = cart.map(product => {
          if (product.id === productId){
              product.amount += 1;
          }
          return product;
        })
        setCart([...newCart]);
      } else {
        const response = await api.get('/products');
        const responseData = response.data as Product[];
        const newProduct = responseData.find(product => product.id === productId) as Product;
        newProduct.amount = 1;
        setCart([...cart, newProduct]);
      }

      console.log('addProduct')
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const newCart = cart.filter(product => product.id !== productId);
      setCart([...newCart]);
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const productInCart = cart.find(product => product.id === productId);
      if (productInCart){
        const newCart = cart.map(product => {
          if (product.id === productId){
              product.amount = amount;
          }
          return product;
        })
        setCart([...newCart]);
      }
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
