import React, { Component } from "react";
import {
  FlatList,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatListProps,
} from "react-native";
import { RefreshState } from "./RefreshState";
import RefreshFooter from "./RefreshFooter";

export type endRefreshing = (footerState: RefreshState) => void;

type Props<ItemT> = {
  onHeaderRefresh?: (endRefreshing: endRefreshing) => void; // 下拉刷新的方法
  onFooterRefresh?: (endRefreshing: endRefreshing) => void; // 上拉加载的方法

  // onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  // onViewableItemsChanged?:
  //   | ((info: {
  //       viewableItems: Array<ViewToken>;
  //       changed: Array<ViewToken>;
  //     }) => void)
  //   | null;
  // ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  // ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  // ItemSeparatorComponent?: React.ComponentType<any> | null;
  // showsVerticalScrollIndicator?: boolean;
  // scrollIndicatorInsets?: Insets; //zeroes
  // keyExtractor?: (item: ItemT, index: number) => string;
  // extraData?: any;
  // style?: ViewStyle;
  // data?: ReadonlyArray<ItemT> | null;
  // numColumns?: number;
  // renderItem: ListRenderItem<ItemT>;
} & FlatListProps<ItemT>;

type State = {
  isHeaderRefreshing: boolean; // 头部是否正在刷新
  isFooterRefreshing: boolean; // 尾部是否正在刷新
  footerState: RefreshState;
};

export default class RefreshListView<ItemT> extends Component<
  Props<ItemT>,
  State
> {
  private _renderFooter = () => {
    return (
      <RefreshFooter
        state={this.state.footerState}
        onRetryLoading={() => {
          //this.beginFooterRefresh()
          this.startFooterRefreshing();
        }}
      />
    );
  };

  listRef: FlatList<ItemT> | null = null;

  constructor(props: Props<ItemT>) {
    super(props);

    this.endRefreshing = this.endRefreshing.bind(this);

    this.state = {
      isHeaderRefreshing: false, // 头部是否正在刷新
      isFooterRefreshing: false, // 尾部是否正在刷新
      footerState: RefreshState.Idle, // 尾部当前的状态，默认为Idle，不显示控件
    };
  }

  public scrollToIndex = (index: number) => {
    if (this.listRef && this.props.data && this.props.data.length > 0) {
      this.listRef.scrollToIndex({
        animated: true,
        index: index,
        viewOffset: 0,
        viewPosition: 0,
      });
    }
  };

  public scrollToOffset = (params: {
    animated?: boolean | null;
    offset: number;
  }) => {
    if (this.listRef) {
      this.listRef.scrollToOffset(params);
    }
  };

  public scrollToTop = () => {
    this.scrollToIndex(0);
  };

  render() {
    return (
      <FlatList
        extraData={this.props.extraData}
        scrollIndicatorInsets={this.props.scrollIndicatorInsets}
        showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
        numColumns={this.props.numColumns}
        data={this.props.data}
        style={this.props.style}
        onViewableItemsChanged={this.props.onViewableItemsChanged}
        ListEmptyComponent={this.props.ListEmptyComponent}
        ItemSeparatorComponent={this.props.ItemSeparatorComponent}
        renderItem={this.props.renderItem}
        ref={(ref) => (this.listRef = ref)}
        refreshControl={
          //设置下拉刷新组件
          this.props.onHeaderRefresh ? (
            <RefreshControl
              refreshing={this.state.isHeaderRefreshing}
              onRefresh={this.beginHeaderRefresh.bind(this)} //(()=>this.onRefresh)或者通过bind来绑定this引用来调用方法
              title={this.state.isHeaderRefreshing ? "刷新中...." : "下拉刷新"}
            />
          ) : // <MyRefreshControl
          //     refreshing={this.state.isHeaderRefreshing}
          //     //onRefresh={}
          // />
          undefined
        }
        ListHeaderComponent={this.props.ListHeaderComponent}
        keyExtractor={(item, index) =>
          this.props.keyExtractor
            ? this.props.keyExtractor(item, index)
            : index.toString()
        }
        directionalLockEnabled
        scrollEventThrottle={16}
        onScroll={this._onScroll.bind(this)}
        ListFooterComponent={this._renderFooter}
      />
    );
  }

  private _onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    //console.log('_onScroll',event.nativeEvent)

    let offsetY = event.nativeEvent.contentOffset.y;
    let height = event.nativeEvent.layoutMeasurement.height;
    let contentHeight = Math.floor(event.nativeEvent.contentSize.height); //解决Android加载更多不触发的问题

    if (this.shouldStartFooterRefreshing()) {
      if (offsetY + height >= contentHeight) {
        console.log("加载更多");
        this.startFooterRefreshing();
      }
    }

    if (this.props.onScroll) this.props.onScroll(event);
  }

  /// 尾部组件的状态，供外部调用，一般不会用到
  footerState() {
    return this.state.footerState;
  }

  /// 开始下拉刷新
  beginHeaderRefresh() {
    if (this.shouldStartHeaderRefreshing()) {
      this.startHeaderRefreshing();
    }
  }

  /// 开始上拉加载更多
  beginFooterRefresh() {
    if (this.shouldStartFooterRefreshing()) {
      this.startFooterRefreshing();
    }
  }

  /// 下拉刷新，设置完刷新状态后再调用刷新方法，使页面上可以显示出加载中的UI，注意这里setState写法
  startHeaderRefreshing() {
    this.setState(
      {
        isHeaderRefreshing: true,
      },
      () => {
        setTimeout(() => {
          this.props.onHeaderRefresh &&
            this.props.onHeaderRefresh(this.endRefreshing);
        }, 500);
      }
    );
  }

  /// 上拉加载更多，将底部刷新状态改为正在刷新，然后调用刷新方法，页面上可以显示出加载中的UI，注意这里setState写法
  startFooterRefreshing() {
    this.setState(
      {
        footerState: RefreshState.Refreshing,
        isFooterRefreshing: true,
      },
      () => {
        this.props.onFooterRefresh &&
          this.props.onFooterRefresh(this.endRefreshing);
      }
    );
  }

  /***
   * 当前是否可以进行下拉刷新
   * @returns {boolean}
   *
   * 如果列表尾部正在执行上拉加载，就返回false
   * 如果列表头部已经在刷新中了，就返回false
   */
  shouldStartHeaderRefreshing() {
    if (
      this.state.footerState === RefreshState.Refreshing ||
      this.state.isHeaderRefreshing ||
      this.state.isFooterRefreshing ||
      this.props.onHeaderRefresh === undefined
    ) {
      return false;
    }
    return true;
  }

  /***
   * 当前是否可以进行上拉加载更多
   * @returns {boolean}
   *
   * 如果底部已经在刷新，返回false
   * 如果底部状态是没有更多数据了，返回false
   * 如果头部在刷新，则返回false
   * 如果列表数据为空，则返回false（初始状态下列表是空的，这时候肯定不需要上拉加载更多，而应该执行下拉刷新）
   */
  shouldStartFooterRefreshing() {
    if (
      this.state.footerState === RefreshState.Refreshing ||
      this.state.footerState === RefreshState.NoMoreData ||
      this.state.footerState === RefreshState.Failure ||
      //this.props.data.length === 0 ||
      this.state.isHeaderRefreshing ||
      this.state.isFooterRefreshing ||
      this.props.onFooterRefresh === undefined
    ) {
      return false;
    }
    return true;
  }

  /**
   * 根据尾部组件状态来停止刷新
   * @param footerState
   *
   * 如果刷新完成，当前列表数据源是空的，就不显示尾部组件了。
   * 这里这样做是因为通常列表无数据时，我们会显示一个空白页，如果再显示尾部组件如"没有更多数据了"就显得很多余
   */
  public endRefreshing(footerState: RefreshState) {
    let footerRefreshState = footerState;
    // if ((this.props.data && this.props.data.length === 0) || (this.props.sections && this.props.sections[this.props.sections.length -1].data.length === 0) ) {
    //   footerRefreshState = RefreshState.Idle;
    // }
    this.setState({
      footerState: footerRefreshState,
      isHeaderRefreshing: false,
      isFooterRefreshing: false,
    });
  }
}
