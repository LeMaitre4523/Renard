import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { Newspaper, Utensils } from 'lucide-react-native';
import { IndexData } from '../fetch/IndexData';
import ListItem from '../components/ListItem';

import GetUIColors from '../utils/GetUIColors';

function relativeDate(date) {
  const now = new Date();
  const diff = now - date;

  if (diff < 1000 * 60) {
    return "À l'instant";
  }
  if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))} minute(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))} heure(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} jour(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 30) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 7))} semaine(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30))} moi(s)`;
  }
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365))} an(s)`;
}

function normalizeText(text) {
  // remove accents and render in lowercase
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeContent(text) {
  return text
    .replace(/(\r\n|\n|\r)/gm,"")
    .trim();
}

function FullNewsIcon({ title }) {
  const UIColors = GetUIColors();

  return (
    <View>
      { normalizeText(title).includes('menu')
        ? <Utensils color={UIColors.primary} size={24} />
        : <Newspaper color={UIColors.primary} size={24} />
      }
    </View>
  )
}

function NewsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [news, setNews] = useState([]);
  let finalNews = [];

  function editNews(n) {
    // invert the news array
    const newNews = n.reverse();

    return newNews;
  }

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  useEffect(() => {
    setIsHeadLoading(true);
    IndexData.getNews().then((n) => {
      setIsHeadLoading(false);
      setNews(editNews(JSON.parse(n)));
      finalNews = editNews(JSON.parse(n));
    });
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    IndexData.getNews(true).then((n) => {
      setNews(editNews(JSON.parse(n)));
      finalNews = editNews(JSON.parse(n));
      setIsHeadLoading(false);
    });
  }, []);

  // add search bar in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        ( isHeadLoading ?
          <ActivityIndicator/>
        : null )
      ),
      headerSearchBarOptions: {
        placeholder: 'Rechercher une actualité',
        cancelButtonText: 'Annuler',
        onChangeText: (event) => {
          const text = event.nativeEvent.text.trim();

          if (text.length > 2) {
            const newNews = [];

            finalNews.forEach((item) => {
              if (
                normalizeText(item.title).includes(normalizeText(text)) ||
                normalizeText(item.content).includes(normalizeText(text))
              ) {
                newNews.push(item);
              }
            });

            setNews(newNews);
          } else {
            setNews(finalNews);
          }
        },
      },
    });
  }, [navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      {news.length > 0 ? (
        <View style={styles.newsList}>
          {news.map((item, index) => {
            let content = item.content.trim();
            if (content.length > 50) {
              content = `${content.substring(0, 50)}...`;
            }

            return (
              <ListItem
                key={index}
                title={item.title}
                subtitle={normalizeContent(content)}
                icon={<FullNewsIcon title={item.title} />}
                color={theme.colors.primary}
                onPress={() =>
                  navigation.navigate('NewsDetails', { news: item })
                }
                right={
                  <Text style={{ fontSize: 13, opacity: 0.5 }}>
                    il y a {relativeDate(new Date(item.date))}
                  </Text>
                }
              />
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  newsList: {
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
});

export default NewsScreen;
