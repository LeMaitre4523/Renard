import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import {
  Diff,
  GraduationCap,
  Percent,
  Share,
  SquareAsterisk,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users2,
  ChevronLeft,
} from 'lucide-react-native';

import { useLayoutEffect } from 'react';
import { PressableScale } from 'react-native-pressable-scale';

import formatCoursName from '../../utils/FormatCoursName';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function calculateAverage(grades, isClass) {
  let average = 0;
  let count = 0;
  for (let i = 0; i < grades.length; i++) {
    if (grades[i].grade.value !== 0) {
      let correctedValue = grades[i].grade.value / grades[i].grade.out_of * 20;
      let correctedClassValue = grades[i].grade.average / grades[i].grade.out_of * 20;

      if (isClass) {
        average += correctedClassValue * grades[i].grade.coefficient;
      } else {
        average += correctedValue * grades[i].grade.coefficient;
      }

      count += grades[i].grade.coefficient;
    }
  }
  average = average / count;
  return average;
}

function GradeView({ route, navigation }) {
  const theme = useTheme();
  const { grade, allGrades } = route.params;
  const UIColors = GetUIColors();

  function shareGrade() {
    Alert.alert(
      'Partager la note',
      "Le partage de la note n'est pas encore disponible.",
      [{ text: 'OK' }]
    );
  }

  let mainColor = '#888888';
  if (grade.color) {
    mainColor = grade.color;
  }

  let { description } = grade;
  if (description === '') {
    description = 'Aucune description';
  }

  /*
  // fix (temp) des notes
  grade.grade.value = grade.grade.value / 20 * grade.grade.out_of;
  grade.grade.max = grade.grade.max / 20 * grade.grade.out_of;
  grade.grade.min = grade.grade.min / 20 * grade.grade.out_of;
  grade.grade.average = grade.grade.average / 20 * grade.grade.out_of;

  // correct class averages
  grade.grade.average = (grade.grade.average / 20) * grade.grade.out_of;
  grade.grade.max = (grade.grade.max / 20) * grade.grade.out_of;
  grade.grade.min = (grade.grade.min / 20) * grade.grade.out_of;
  */

  // change header title component
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: description,
      headerStyle: {
        backgroundColor: mainColor,
      },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity onPress={() => shareGrade()}>
          <Share size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        Platform.OS === 'ios' ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iosBack}>
            <ChevronLeft size={26} color="#fff" style={styles.iosBackIcon} />
          </TouchableOpacity>
        ) : null
      ),
    });
  }, [navigation, grade]);

  const formattedValue = parseFloat(grade.grade.value).toFixed(2);
  const valueTop = formattedValue.split('.')[0];
  const valueBottom = formattedValue.split('.')[1];

  let gradesListWithoutGrade = [];
  for (let i = 0; i < allGrades.length; i++) {
    if (allGrades[i].id !== grade.id) {
      gradesListWithoutGrade.push(allGrades[i]);
    }
  }

  const average = calculateAverage(allGrades, false);
  const averageWithoutGrade = calculateAverage(gradesListWithoutGrade, false);
  const avgInfluence = average - averageWithoutGrade;

  const avgPercentInfluence = (avgInfluence / average) * 100;

  const classAvg = calculateAverage(allGrades, true);
  const classAvgWithoutGrade = calculateAverage(gradesListWithoutGrade, true);
  const classAvgInfluence = classAvg - classAvgWithoutGrade;

  return (
    <>
      <StatusBar
        animated
        backgroundColor={mainColor}
        barStyle="light-content"
      />
      <View style={[styles.gradeHeader, { backgroundColor: mainColor }]}>
        <View style={[styles.gradeHeaderTitle]}>
          <Text style={[styles.gradeHeaderSubject]}>
            {formatCoursName(grade.subject.name)}
          </Text>
          <Text style={[styles.gradeHeaderDate]}>
            {new Date(grade.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={[styles.gradeHeaderGrade]}>
          {grade.grade.significant === 0 ? (
            <>
              <Text style={[styles.gradeHeaderGradeValueTop]}>{valueTop}</Text>
              <Text style={[styles.gradeHeaderGradeValueBottom]}>
                .{valueBottom}
              </Text>
            </>
          ) : grade.grade.significant === 3 ? (
            <Text style={[styles.gradeHeaderGradeValueTop]}>Abs.</Text>
          ) : (
            <Text style={[styles.gradeHeaderGradeValueTop]}>N.not</Text>
          )}

          <Text style={[styles.gradeHeaderGradeScale]}>
            /{grade.grade.out_of}
          </Text>
        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: UIColors.background }}
      >

        <NativeList
          inset
          header="Détails de la note"
        >
          <NativeItem
            leading={
              <SquareAsterisk color={UIColors.text} />
            }
            trailing={
              <NativeText heading="h4">
                x {parseFloat(grade.grade.coefficient).toFixed(2)}
              </NativeText>
            }
          >
            <NativeText heading="p2">
              Coefficient
            </NativeText>
          </NativeItem>
          
          <NativeItem
            leading={
              <GraduationCap color={UIColors.text} />
            }
            trailing= {
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {parseFloat(
                    (grade.grade.value / grade.grade.out_of) * 20
                  ).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>/20</Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Remis sur /20
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList
          inset
          header="Moyennes"
        >
          <NativeItem
            leading={
              <Users2 color={UIColors.text} />
            }
            trailing={
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {parseFloat(grade.grade.average).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>
                  /{grade.grade.out_of}
                </Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Moy. de la classe
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <TrendingDown color={UIColors.text} />
            }
            trailing={
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {parseFloat(grade.grade.min).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>
                  /{grade.grade.out_of}
                </Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Note minimale
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <TrendingUp color={UIColors.text} />
            }
            trailing={
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {parseFloat(grade.grade.max).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>
                  /{grade.grade.out_of}
                </Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Note maximale
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList
          inset
          header="Influence"
        >
          <NativeItem
            leading={
              <UserPlus color={UIColors.text} />
            }
            trailing={
              avgInfluence > 0 ? (
                <NativeText heading="h4" style={{ color: "#1AA989" }}>
                  + {parseFloat(avgInfluence).toFixed(2)} pts
                </NativeText>
              ) : (
                <NativeText heading="h4" style={{ color: "#D81313" }}>
                  - {parseFloat(avgInfluence).toFixed(2) * -1} pts
                </NativeText>
              )
            }
          >
            <NativeText heading="p2">
              Moyenne générale
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <Users2 color={UIColors.text} />
            }
            trailing={
              classAvgInfluence > 0 ? (
                <NativeText heading="h4">
                  + {parseFloat(classAvgInfluence).toFixed(2)} pts
                </NativeText>
              ) : (
                <NativeText heading="h4">
                  - {parseFloat(classAvgInfluence).toFixed(2) * -1} pts
                </NativeText>
              )
            }
          >
            <NativeText heading="p2">
              Moyenne de classe
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <Percent color={UIColors.text} />
            }
            trailing={
              avgPercentInfluence > 0 ? (
                <NativeText heading="h4" style={{ color: "#1AA989" }}>
                  + {parseFloat(avgPercentInfluence).toFixed(2)} %
                </NativeText>
              ) : (
                <NativeText heading="h4" style={{ color: "#D81313" }}>
                  - {parseFloat(avgPercentInfluence).toFixed(2) * -1} %
                </NativeText>
              )
            }
          >
            <NativeText heading="p2">
              Pourcentage d'influence
            </NativeText>
            <NativeText heading="subtitle2">
              sur la moyenne générale
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList
          inset
          header="Informations"
        >
          <NativeItem
            leading={
              <Diff color={UIColors.text} />
            }
            trailing={
              (grade.grade.value - grade.grade.average).toFixed(2) > 0 ? (
                <NativeText heading="h4" style={{ color: "#1AA989" }}>
                  + {(grade.grade.value - grade.grade.average).toFixed(2)} pts
                </NativeText>
              ) : (
                <NativeText heading="h4" style={{ color: "#D81313" }}>
                  - {(grade.grade.value - grade.grade.average).toFixed(2) * -1} pts
                </NativeText>
              )
            }
          >
            <NativeText heading="p2">
              Diff. avec la moyenne
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 16,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 14,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  gradeHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  gradeHeaderTitle: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
    maxWidth: '72%',
  },
  gradeHeaderSubject: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#fff',
  },
  gradeHeaderDate: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    opacity: 0.6,
  },

  gradeHeaderGrade: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 1,
    minWidth: 100,
  },
  gradeHeaderGradeValueTop: {
    fontSize: 36,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    letterSpacing: 0.5,
  },
  gradeHeaderGradeValueBottom: {
    fontSize: 24,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  gradeHeaderGradeScale: {
    fontSize: 20,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    opacity: 0.6,
    marginBottom: 2,
    letterSpacing: 0.5,
  },

  gradeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 18,
    borderRadius: 12,
  },
  averageIcon: {
    opacity: 0.7,
    marginBottom: 1,
  },
  gradeDetailTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Medium',
    opacity: 0.6,
    flex: 1,
  },
  gradeDetailRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 0,
    marginBottom: 1,
  },
  gradeDetailValue: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    letterSpacing: 0.15,
  },
  gradeDetailValueSub: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.6,
    letterSpacing: 0.15,
  },

  iosBack: {
    width: 32,
    height: 32,

    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#ffffff33',
  },

  iosBackIcon: {
    width: 0,
    height: 0,
    marginTop: -1,
    marginLeft: -1,
  },
});

export default GradeView;
