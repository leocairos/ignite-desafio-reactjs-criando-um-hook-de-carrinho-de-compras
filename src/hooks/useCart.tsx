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
      const responseStock = await api.get(`/stock/${productId}`);
      const productStock = responseStock.data as Stock;
      const productInCart = cart.find(product => product.id === productId);
      if (productInCart && productStock){
        if (productInCart.amount + 1 < productStock.amount) {
          const newCart = cart.map(product => {
            if (product.id === productId){
              product.amount += 1;
            }
            return product;
          })
          setCart([...newCart]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } else {
        const response = await api.get(`/products/${productId}`);
        const newProduct = response.data as Product;

        newProduct.amount = 1;
        setCart([...cart, newProduct]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, newProduct]))
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productInCart = cart.find(product => product.id === productId);
      if (!productInCart) throw new Error('Produto não encontrado')
      const newCart = cart.filter(product => product.id !== productId);
      setCart([...newCart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount<1){
        return null;
      }
      const responseStock = await api.get(`/stock/${productId}`);
      const productStock = responseStock.data as Stock;

      
      if (productStock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return null;
      }

      const newCart = cart.map(product => {
        if (product.id === productId){
           product.amount = amount;
        }
        return product;
      })
      
      setCart([...newCart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
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
