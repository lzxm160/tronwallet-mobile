import React from 'react'
import moment from 'moment'
import { Feather } from '@expo/vector-icons'

import * as Utils from '../../components/Utils'

export default ({ item }) => (<Utils.TransactionCard>
  <Utils.Row style={{ justifyContent: 'space-between' }}>
    <Utils.Text size='small' secondary>Transaction Type {item.contractType}</Utils.Text>
    <Utils.Text size='xsmall'>
      <Feather name='refresh-cw' size={14} color='#ffffff' />
    </Utils.Text>
  </Utils.Row>
  <Utils.VerticalSpacer size='small' />
  <Utils.Text font='light' size='xsmall' secondary>{moment(item.timestamp).fromNow()}</Utils.Text>
</Utils.TransactionCard>
)