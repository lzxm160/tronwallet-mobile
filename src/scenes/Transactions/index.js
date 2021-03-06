import React, { Component } from 'react'
import { FlatList, AsyncStorage, Platform, Image } from 'react-native'
import { Answers } from 'react-native-fabric'

import tl from '../../utils/i18n'
import Transaction from './Transaction'
import { Background, InnerRow, FilterText, FilterWrapper } from './elements'
import NavigationHeader from '../../components/Navigation/Header'
import SyncButton from '../../components/SyncButton'
import { USER_FILTERED_TOKENS } from '../../utils/constants'

import getAssetsStore from '../../store/assets'
import getTransactionStore from '../../store/transactions'
import { withContext } from '../../store/context'
import { updateTransactions, getTokenPriceFromStore } from '../../utils/transactionUtils'
import getContactsStore from '../../store/contacts'
import { logSentry } from '../../utils/sentryUtils'
import { Colors } from '../../components/DesignSystem'
import Empty from './Empty'
import FontelloButton from '../../components/FontelloButton'

class TransactionsScene extends Component {
  static navigationOptions = () => ({header: null})

  state = {
    refreshing: true,
    transactions: [],
    currentAlias: '',
    contact: null,
    contacts: []
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Transactions')
    this._didFocusSubscription = this.props.navigation.addListener('didFocus', this._didFocus)
    this._setData()
  }

  componentWillUnmount () {
    this._didFocusSubscription.remove()
  }

  _setData = async () => {
    const transactionStoreRef = await getTransactionStore()
    const contactsStoreRef = await getContactsStore()
    const assetStore = await getAssetsStore()
    this.setState({ transactionStoreRef, contactsStoreRef, assetStore }, () => this._loadData())
  }

  _didFocus = () => {
    if (this.state.transactionStoreRef && !this.state.refreshing) {
      this._loadData()
    }
  }

  _firstTransactions = () => this._allTransactions().slice(0, 10)

  _allTransactions = () => (
    this.state.transactionStoreRef
      .objects('Transaction')
      .filtered('ownerAddress = $0', this.props.context.publicKey)
      .sorted([['timestamp', true]])
  )

  _getAlias = address => {
    if (!address) return
    const contact = this.state.contacts.find(c => c.address === address)
    return contact ? contact.alias : address
  }

  _loadData = async isRefreshing => {
    this.setState({ refreshing: true })

    const contacts = this.state.contactsStoreRef.objects('Contact').map(item => Object.assign({}, item))
    const foundAlias = contacts.find(c => c.address === this.props.context.publicKey)
    const currentAlias = foundAlias ? foundAlias.alias : this.props.context.publicKey
    const contact = this.props.navigation.getParam('contact', null)

    this.setState({ currentAlias, contacts, contact }, async () => {
      try {
        await updateTransactions(this.props.context.publicKey)
        if (contact) {
          this._setFilteredContact(contact)
        } else {
          const transactionRef = isRefreshing ? this._allTransactions() : this._firstTransactions()
          this._updateData(transactionRef, isRefreshing)
        }
      } catch (error) {
        logSentry(error, 'On Refresh - Transactions')
      }
    })
  }

  _setFilteredContact = contact => {
    const transactionsFiltered = this.state.transactionStoreRef
      .objects('Transaction')
      .filtered('contractData.transferFromAddress = $0 OR contractData.transferToAddress = $0', contact.address)
      .sorted([['timestamp', true]])

    this._updateData(transactionsFiltered)
  }

  _removeFilteredContact = () => {
    this.props.navigation.setParams({ contact: null })
    this.setState({contact: null}, () => this._loadData())
  }

  _updateData = async (transactionsRef, isRefreshing = false) => {
    try {
      const allTransactions = transactionsRef.map(item => Object.assign({}, item))
      const transactionsWithParticipate = this._updateParticipateTransactions(allTransactions, this.state.assetStore)
      let transactions = this._getTransactionByAddress(transactionsWithParticipate)

      if (isRefreshing) {
        transactions = this._mergeNewTransactions(transactions)
      }
      const filteredTransactions = await this._getFilteredTransactions(transactions)

      this.setState({ transactions: filteredTransactions, refreshing: false })
    } catch (err) {
      this.setState({ refreshing: false })
      logSentry(err, 'Transactions - load data')
    }
  }

  _getFilteredTransactions = async (transactions) => {
    const userTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
    return transactions.filter(({ type, contractData }) =>
      contractData.tokenName === null ||
            JSON.parse(userTokens).findIndex(name => name === contractData.tokenName) === -1
    )
  }

  _updateParticipateTransactions = (transactions, assetStore) => (
    transactions.map((transaction) => {
      if (transaction.type === 'Participate') {
        const tokenPrice = getTokenPriceFromStore(transaction.contractData.tokenName, assetStore)
        return { ...transaction, tokenPrice }
      } else {
        return transaction
      }
    })
  )

  _getTransactionByAddress = (transactions) => transactions
    .filter(item => item.ownerAddress === this.props.context.publicKey)
    .map(item => Object.assign({},
      {...item,
        contractData: {
          ...item.contractData,
          transferFromAddress: this._getAlias(item.contractData.transferFromAddress),
          transferToAddress: this._getAlias(item.contractData.transferToAddress)
        }}))

  _mergeNewTransactions = (newTransactions) => {
    const { transactions: currentTransactions } = this.state
    const oldTransactions = currentTransactions.filter(t => !newTransactions.find(n => n.id === t.id))
    return [...newTransactions, ...oldTransactions]
  }

  _loadRemainingTransactions = async () => {
    if (this.state.transactionStoreRef && !this.state.refreshing) {
      this._loadData(true)
    }
  }

  _navigateToDetails = (item) => {
    this.props.navigation.navigate('TransactionDetails', { item })
  }

  _renderFilter = () => {
    const { contact } = this.state
    if (contact && contact.address) {
      return <FilterWrapper>
        <InnerRow>
          <Image
            source={require('../../assets/gradient-book.png')}
            style={{width: 16, height: 16}}
            color={Colors.buttonGradient[1]}
          />
          <FilterText marginX={12} dark>{tl.t('filter')}:</FilterText>
          <FilterText numberOfLines={1}>{contact.alias}</FilterText>
        </InnerRow>
        <InnerRow>
          <FontelloButton
            onPress={this._removeFilteredContact}
            name='close'
            color='white'
            size={16}
          />
        </InnerRow>
      </FilterWrapper>
    } else {
      return null
    }
  }
  render () {
    const { refreshing, currentAlias } = this.state
    const { publicKey } = this.props.context
    const { transactions } = this.state

    return (
      <Background>
        <NavigationHeader
          title={tl.t('transactions.title')}
          leftButton={<SyncButton
            loading={refreshing}
            onPress={() => this._loadData(true)}
          />}
        />
        <FlatList
          data={transactions}
          ListEmptyComponent={<Empty loading={refreshing} />}
          ListHeaderComponent={this._renderFilter}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Transaction item={item} currentAlias={currentAlias} onPress={() => this._navigateToDetails(item)} publicKey={publicKey} />}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          onEndReached={this._loadRemainingTransactions}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </Background>
    )
  }
}

export default withContext(TransactionsScene)
