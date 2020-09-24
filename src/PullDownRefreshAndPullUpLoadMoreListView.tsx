/**
 *  Created by Damon on 2018/8/21
 */

import React from "react";
import { ViewStyle, ListRenderItem, ViewToken } from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import RefreshListView, { endRefreshing } from "./RefreshListView";
import { RefreshState } from "./RefreshState";

import Loading from "./Loading";
import Error from "./ErrorComponent";

type Props<ItemT> = {
  enableLoadMoreData?: boolean; //开启加载更多
  enableRefreshing?: boolean; //开启下拉刷新
  showLoading?: boolean;
  onePageSize: number; //每页加载的数量
  initialPage: number; //初始页 一般 0 / 1

  ErrorComponent?: React.ComponentType<any> | React.ReactElement | null;
  LoadingComponent?: React.ReactElement | null;

  loadDataFunction: (
    page: number,
    page_size: number,
    ...restOfParams: any[]
  ) => Promise<ItemT[]>; //加载数据的函数
  loadDataParams: any[]; //需要的参数

  style?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  onViewableItemsChanged?:
    | ((info: {
        viewableItems: Array<ViewToken>;
        changed: Array<ViewToken>;
      }) => void)
    | null;
  ListEmptyComponent?: React.ReactElement | null;

  numColumns?: number;
  renderItem: ListRenderItem<ItemT>;

  keyExtractor?: (item: ItemT, index: number) => string;
  extraData?: any;
};

type State<ItemT> = {
  loading: boolean;
  error: boolean;
  page: number;
  data: ItemT[];
};

const DEFAULT_PAGE_SIZE = 10; //每一页大小
const INITIAL_PAGE = 1; //初始页

export default class PullDownRefreshAndPullUpLoadMoreListView<
  ItemT
> extends React.Component<Props<ItemT>, State<ItemT>> {
  static Loading = Loading;
  static ErrorView = Error;

  static defaultProps: any = {
    showLoading: true,
    enableLoadMoreData: true,
    enableRefreshing: true,
    onePageSize: DEFAULT_PAGE_SIZE,
    initialPage: INITIAL_PAGE,
  };

  refreshListViewRef: RefreshListView<ItemT> | null = null;

  private _onHeaderRefresh = async (endRefreshing: endRefreshing) => {
    const {
      loadDataFunction,
      loadDataParams,
      onePageSize,
      initialPage,
    } = this.props;

    if (!loadDataFunction) return;

    try {
      let data = await loadDataFunction(
        initialPage,
        onePageSize,
        ...loadDataParams
      );

      if (data && data.length >= onePageSize) {
        this.setState(
          () => ({
            data: data,
            page: initialPage + 1,
            loading: false,
            error: false,
          }),
          () => {
            setTimeout(() => {
              endRefreshing && endRefreshing(RefreshState.CanLoadMore);
            }, 300);
          }
        );
      } else {
        this.setState(
          () => ({
            data: data,
            page: initialPage + 1,
            loading: false,
            error: false,
          }),
          () => {
            endRefreshing && endRefreshing(RefreshState.NoMoreData);
          }
        );
      }
    } catch (error) {
      endRefreshing && endRefreshing(RefreshState.Idle);
    }
  };
  private _onFirstLoading = async () => {
    const {
      loadDataFunction,
      loadDataParams,
      onePageSize,
      initialPage,
    } = this.props;

    if (!loadDataFunction) return;

    try {
      let data = await loadDataFunction(
        initialPage,
        onePageSize,
        ...loadDataParams
      );

      if (data && data.length >= onePageSize) {
        this.setState(
          () => ({
            data: data,
            page: initialPage + 1,
            error: false,
            loading: false,
          }),
          () => {
            setTimeout(() => {
              this.refreshListViewRef &&
                this.refreshListViewRef.endRefreshing(RefreshState.CanLoadMore);
            }, 300);
          }
        );
      } else {
        this.setState(
          () => ({
            data: data,
            page: initialPage + 1,
            error: false,
            loading: false,
          }),
          () => {
            this.refreshListViewRef &&
              this.refreshListViewRef.endRefreshing(RefreshState.NoMoreData);
          }
        );
      }
    } catch (error) {
      this.setState({ loading: false, error: true });
    }
  };
  private _onFooterRefresh = async (endRefreshing: endRefreshing) => {
    const { loadDataFunction, loadDataParams, onePageSize } = this.props;

    if (!loadDataFunction) return;

    try {
      let data = await loadDataFunction(
        this.state.page,
        onePageSize,
        ...loadDataParams
      );

      if (data && data.length > 0) {
        this.setState(
          (preState) => ({
            data: preState.data.concat(data),
            page: preState.page + 1,
            loading: false,
            error: false,
          }),
          () => {
            setTimeout(() => {
              endRefreshing && endRefreshing(RefreshState.CanLoadMore);
            }, 300);
          }
        );
      } else {
        endRefreshing && endRefreshing(RefreshState.NoMoreData);
      }
    } catch (error) {
      endRefreshing && endRefreshing(RefreshState.Failure);
    }
  };

  constructor(props: Props<ItemT>) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      page: props.initialPage,
      data: [],
    };
  }

  componentDidMount() {
    this._onFirstLoading();
  }

  public reloadData = () => {
    this._onHeaderRefresh(this.refreshListViewRef!.endRefreshing);
  };

  /**
   * 插入第一个
   */
  public insertItemFirst = (item: ItemT, callBack?: () => void) => {
    this.setState({ data: [item, ...this.state.data] }, callBack);
  };

  //更新
  public updateItem = (item: ItemT, index: number) => {
    let data = this.state.data;
    data[index] = item;
    this.setState({
      data: data,
    });
  };

  //删除
  public deleteItem = (index: number) => {
    let data = this.state.data;
    data.splice(index, 1);
    this.setState(() => ({
      data,
    }));
  };

  private _ListEmptyComponent = () => {
    const { ListEmptyComponent } = this.props;

    if (ListEmptyComponent != null) {
      return ListEmptyComponent;
    } else {
      return <Error onPress={() => {}} errorInfo={"当前页面暂无数据"} />;
    }
  };

  public scrollToIndex = (index: number) => {
    this.refreshListViewRef && this.refreshListViewRef.scrollToIndex(index);
  };

  render() {
    const {
      style,
      enableLoadMoreData,
      enableRefreshing,
      numColumns,
      extraData,
      showLoading,
      ...props
    } = this.props;

    let { data, loading, error } = this.state;

    if (error) {
      return (
        <PullDownRefreshAndPullUpLoadMoreListView.ErrorView
          onPress={() => {
            this.setState({
              loading: true,
              error: false,
            });
            this._onFirstLoading();
          }}
        />
      );
    } else if (loading) {
      return showLoading ? (
        <PullDownRefreshAndPullUpLoadMoreListView.Loading />
      ) : null;
    } else
      return (
        <RefreshListView
          data={data}
          //contentContainerStyle={{ flexGrow: 1 }}
          scrollIndicatorInsets={{ right: 1 }}
          extraData={extraData}
          numColumns={numColumns}
          ref={(ref) => (this.refreshListViewRef = ref)}
          style={style}
          keyExtractor={(item, index) =>
            this.props.keyExtractor
              ? this.props.keyExtractor(item, index)
              : index.toString()
          }
          ListEmptyComponent={this._ListEmptyComponent}
          onHeaderRefresh={enableRefreshing ? this._onHeaderRefresh : undefined}
          onFooterRefresh={
            enableLoadMoreData && data.length > 0
              ? this._onFooterRefresh
              : undefined
          }
          // renderItem={this.props.renderItem}
          // ListHeaderComponent={this.props.ListHeaderComponent}
          {...props}
        />
      );
  }
}
