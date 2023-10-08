import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom";
import { CryptoState } from "../CryptoContext";
import axios from "axios";
import { SingleCoin } from "../config/api";
import {
  Button,
  LinearProgress,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CoinFor from "../components/CoinFor";

import parse from "html-react-parser";
import { db } from "../Firebase";
import { doc, setDoc } from "firebase/firestore";

export function numberwithcommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const Coinpage = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState();
  const { currency, symbol, user, watchlist, setAlert } = CryptoState();

  const fetchcoins = async () => {
    const { data } = await axios.get(SingleCoin(id));
    setCoin(data);
  };

  // console.log(coin);

  useEffect(() => {
    fetchcoins();
  }, []);

  const useStyles = makeStyles((theme) => ({
    container: {
      display: "flex",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItem: "center",
      },
    },
    sidebar: {
      width: "30%",
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: 25,
      borderRight: "2px solid grey",
    },
    heading: {
      fontWeight: "bold",
      fontFamily: "Montserrat",
      marginBottom: 20,
    },
    description: {
      width: "100%",
      fontFamily: "Montserrat",
      padding: 25,
      paddingBottom: 15,
      paddingTop: 0,
      textAlign: "justify",
    },
    marketdata: {
      alignSelf: "start",
      padding: 25,
      paddingTop: 10,
      width: "100%",
      [theme.breakpoints.down("md")]: {
        display: "flex",
        alignItem: "center",
        flexDirection: "column",
      },
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "center",
      },
      [theme.breakpoints.down("xs")]: {
        alignItems: "start",
      },
    },
  }));

  const inwatchlist = watchlist.includes(coin?.id);

  const addtowatchlist = async () => {
    const coinref = doc(db, "watchlist", user.uid);
    try {
      await setDoc(coinref, {
        coins: watchlist ? [...watchlist, coin?.id] : [coin?.id],
      });

      setAlert({
        open: true,
        message: `${coin.name} Added to the Watchlist !`,
        type: "success",
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: "error",
      });
    }
  };

  const removefromwatchlist = async () => {
    const coinref = doc(db, "watchlist", user.uid);
    try {
      await setDoc(
        coinref,
        {
          coins: watchlist.filter((watch) => watch !== coin?.id),
        },
        { merge: "true" }
      );

      setAlert({
        open: true,
        message: `${coin.name} Removed  from the Watchlist !`,
        type: "success",
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: "error",
      });
    }
  };

  const classes = useStyles();

  if (!coin) return <LinearProgress style={{ backgroundColor: "gold" }} />;

  return (
    <div className={classes.container}>
      <div className={classes.sidebar}>
        <img
          src={coin?.image.large}
          alt={coin?.name}
          height="200"
          style={{ marginBottom: 20 }}
        />

        <Typography variant="h3" className={classes.heading}>
          {coin?.name}
        </Typography>

        <Typography variant="subtitle1" className={classes.description}>
          {parse(coin?.description.en.split(". ")[0])}
        </Typography>

        <div className={classes.marketdata}>
          <span style={{ display: "flex" }}>
            <Typography variant="h5" className={classes.heading}>
              Rank:
            </Typography>
            &nbsp;&nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {numberwithcommas(coin?.market_cap_rank)}
            </Typography>
          </span>

          <span style={{ display: "flex" }}>
            <Typography variant="h5" className={classes.heading}>
              Current price:
            </Typography>
            &nbsp;&nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {currency === "INR"
                ? "₹" +
                  " " +
                  numberwithcommas(
                    coin?.market_data.current_price[currency.toLowerCase()]
                  )
                : "$" +
                  numberwithcommas(
                    coin?.market_data.current_price[currency.toLowerCase()]
                  )}
            </Typography>
          </span>

          <span style={{ display: "flex" }}>
            <Typography variant="h5" className={classes.heading}>
              Market cap:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {currency === "INR"
                ? "₹" +
                  " " +
                  numberwithcommas(
                    coin?.market_data.market_cap[currency.toLowerCase()]
                      .toString()
                      .slice(0, -6)
                  ) +
                  "M"
                : "$" +
                  " " +
                  numberwithcommas(
                    coin?.market_data.market_cap[currency.toLowerCase()]
                      .toString()
                      .slice(0, -6)
                  ) +
                  "M"}
            </Typography>
          </span>

          {user && (
            <Button
              variant="outlined"
              style={{
                width: "100%",
                height: 40,
                backgroundColor: inwatchlist ? "#ff0000" : "#EEBC1D",
              }}
              onClick={inwatchlist ? removefromwatchlist : addtowatchlist}
            >
              {inwatchlist ? "Remove from watchlist" : "Add to watchlist"}
            </Button>
          )}
        </div>
      </div>

      <CoinFor coin={coin} />
    </div>
  );
};

export default Coinpage;
