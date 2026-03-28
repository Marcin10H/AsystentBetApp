import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';
import { Text, useTheme } from 'react-native-paper';
import type { TimeRange } from '../utils/dateRange';
import type { ChartPoint } from '../utils/stats';

const Y_AXIS_CHART_WIDTH = 108;
const Y_AXIS_PADDING_RIGHT = 96;
const MAIN_CHART_PADDING_RIGHT = 12;
const X_AXIS_LABEL_ROTATION = -48;

type Props = {
  points: ChartPoint[];
  timeRange: TimeRange;
  height?: number;
  screenWidth?: number;
};

const lineChartBaseStyle = {
  marginLeft: 0,
  marginRight: 0,
  marginVertical: 0,
  paddingLeft: 0,
  borderRadius: 0,
};

export function ProfitLineChart({
  points,
  timeRange,
  height = 220,
  screenWidth: screenWidthProp,
}: Props) {
  const theme = useTheme() as any;
  const windowWidth = Dimensions.get('window').width;
  const passedWidth =
    typeof screenWidthProp === 'number' && screenWidthProp > 0
      ? screenWidthProp
      : null;
  const contentWidth = Math.max(passedWidth ?? windowWidth - 40, 280);

  let labels: string[] = [];
  const seriesData: number[] = [];
  if (!points.length) {
    labels = ['—'];
    seriesData.push(0);
  } else {
    labels = points.map((p) => p.label);
    points.forEach((p) => seriesData.push(p.value));
  }

  const dayCount = points.length > 0 ? points.length : 1;
  const useHorizontalScroll = timeRange === 'month' && points.length > 0;
  const mainAreaWidth = Math.max(contentWidth - Y_AXIS_CHART_WIDTH, 0);
  const minWidthPerPoint =
    timeRange === 'week' ? 44 : timeRange === 'year' ? 36 : 45;
  const mainChartWidth = useHorizontalScroll
    ? Math.max(mainAreaWidth, dayCount * 45)
    : Math.max(mainAreaWidth, 200, dayCount * minWidthPerPoint);
  const needsHorizontalScroll =
    useHorizontalScroll || mainChartWidth > mainAreaWidth + 2;

  const chartConfig: AbstractChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(78, 229, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(232, 234, 237, ${opacity})`,
    propsForDots: {
      r: 4,
      strokeWidth: 2,
      stroke: theme.colors.primary,
    },
  };

  const chartStyleYAxis = {
    ...lineChartBaseStyle,
    paddingTop: 16,
    paddingRight: Y_AXIS_PADDING_RIGHT,
  };

  const chartStyleMain = {
    ...lineChartBaseStyle,
    paddingTop: 16,
    paddingRight: MAIN_CHART_PADDING_RIGHT,
  };

  // Lewy mini-wykres: niewidoczna linia, tylko skala PLN (ta sama co po prawej).
  const dataYAxis = {
    labels,
    datasets: [
      {
        data: seriesData,
        color: () => 'rgba(0,0,0,0)',
        strokeWidth: 0,
        withDots: false,
      },
    ],
  };

  const dataMain = {
    labels,
    datasets: [{ data: seriesData }],
  };

  const lineChartYAxis = (
    <LineChart
      data={dataYAxis}
      width={Y_AXIS_CHART_WIDTH}
      height={height}
      chartConfig={chartConfig}
      style={chartStyleYAxis}
      transparent
      bezier
      withInnerLines
      withOuterLines={false}
      withHorizontalLines
      withVerticalLines={false}
      withHorizontalLabels
      withVerticalLabels={false}
      withDots={false}
      withShadow={false}
      fromZero={false}
      yAxisSuffix=" PLN"
      yAxisLabel=""
      yLabelsOffset={4}
    />
  );

  const lineChartMain = (
    <LineChart
      data={dataMain}
      width={mainChartWidth}
      height={height}
      chartConfig={chartConfig}
      style={chartStyleMain}
      transparent
      bezier
      withInnerLines
      withOuterLines={false}
      withHorizontalLines
      withVerticalLines
      withHorizontalLabels={false}
      withVerticalLabels
      withDots
      withShadow
      fromZero={false}
      yAxisSuffix=" PLN"
      yAxisLabel=""
      verticalLabelRotation={X_AXIS_LABEL_ROTATION}
      xLabelsOffset={4}
    />
  );

  const splitRow =
    points.length > 0 ? (
      <View style={styles.chartRow}>
        <View style={styles.yAxisColumn}>{lineChartYAxis}</View>
        <ScrollView
          horizontal
          scrollEnabled={needsHorizontalScroll}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.mainScroll}
          contentContainerStyle={
            needsHorizontalScroll
              ? styles.mainScrollContentScroll
              : styles.mainScrollContentStatic
          }
        >
          {lineChartMain}
        </ScrollView>
      </View>
    ) : null;

  const emptyChart = (
    <LineChart
      data={{ labels, datasets: [{ data: seriesData }] }}
      width={contentWidth}
      height={height}
      chartConfig={chartConfig}
      style={styles.chartSingle}
      transparent
      bezier
      withInnerLines
      withOuterLines={false}
      fromZero={false}
      yAxisSuffix=" PLN"
      yAxisLabel=""
    />
  );

  const angledXLabels = points.length > 0;

  return (
    <View>
      <Text
        variant="labelSmall"
        style={[styles.axisHint, { color: theme.colors.onSurfaceVariant }]}
      >
        Oś pionowa: kwota (PLN)
      </Text>
      <View
        style={[styles.chartBlock, angledXLabels && styles.chartBlockAngledX]}
      >
        {splitRow ?? emptyChart}
      </View>
      {!points.length ? (
        <Text variant="bodySmall" style={styles.empty}>
          Brak danych w wybranym okresie
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  axisHint: {
    marginBottom: 4,
  },
  chartBlock: {
    paddingBottom: 25,
  },
  chartBlockAngledX: {
    paddingBottom: 44,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 8,
  },
  yAxisColumn: {
    width: Y_AXIS_CHART_WIDTH,
    overflow: 'hidden',
  },
  mainScroll: {
    flex: 1,
    minWidth: 0,
  },
  mainScrollContentScroll: {
    flexGrow: 1,
  },
  mainScrollContentStatic: {
    flexGrow: 1,
    alignItems: 'flex-start',
  },
  chartSingle: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 8,
    marginBottom: 0,
    paddingLeft: 0,
    borderRadius: 0,
  },
  empty: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
